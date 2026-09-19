import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import {
  PAGE_SIZE,
  assembleAllBreeds,
  breedDetailUrl,
  breedListUrl,
  groupsUrl,
} from '../src/services/modules/dogbreed'
import { borderCollie, chihuahua } from './fixtures'

const page = (breeds: typeof borderCollie[], current: number, last: number) => ({
  data: breeds,
  meta: { pagination: { current, next: current < last ? current + 1 : null, last, records: 283 } },
})

describe('Dog API endpoints', () => {
  it('paginates breeds at 48 per page', () => {
    expect(PAGE_SIZE).toBe(48)
    expect(breedListUrl(1)).toBe('/breeds?page[number]=1&page[size]=48')
    expect(breedListUrl(6)).toBe('/breeds?page[number]=6&page[size]=48')
  })

  it('builds detail and group URLs', () => {
    expect(breedDetailUrl('abc')).toBe('/breeds/abc')
    expect(groupsUrl).toBe('/groups')
  })

  it('fetches page 1 then remaining pages in windows and merges unique breeds', async () => {
    const requested: string[] = []
    const result = await assembleAllBreeds(async url => {
      requested.push(url)
      if (url.includes('page[number]=1')) {
        return { data: page([borderCollie], 1, 3) }
      }
      if (url.includes('page[number]=2')) {
        return { data: page([chihuahua], 2, 3) }
      }
      if (url.includes('page[number]=3')) {
        return { data: page([borderCollie], 3, 3) }
      }
      return { error: { status: 404, data: 'missing' } as FetchBaseQueryError }
    })

    expect('data' in result && result.data).toBeTruthy()
    if (!('data' in result) || !result.data) {
      throw new Error('expected merged data')
    }
    expect(result.data.partialError).toBe(false)
    expect(result.data.breeds.map(breed => breed.id).sort()).toEqual([
      'breed-chi',
      'breed-collie',
    ])
    expect(requested).toEqual([
      breedListUrl(1),
      breedListUrl(2),
      breedListUrl(3),
    ])
  })

  it('returns an error when the first page fails', async () => {
    const error = { status: 500, data: 'down' } as FetchBaseQueryError
    const result = await assembleAllBreeds(async () => ({ error }))
    expect(result).toEqual({ error })
  })

  it('keeps cached pages and flags partialError when a later page fails', async () => {
    const result = await assembleAllBreeds(async url => {
      if (url.includes('page[number]=1')) {
        return { data: page([borderCollie], 1, 2) }
      }
      return { error: { status: 503, data: 'timeout' } as FetchBaseQueryError }
    })

    expect('data' in result && result.data?.partialError).toBe(true)
    if ('data' in result) {
      expect(result.data?.breeds).toEqual([borderCollie])
    }
  })
})
