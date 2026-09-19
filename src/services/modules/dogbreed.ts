import { api } from "../api"
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import type {
  AllBreedsResult,
  Breed,
  BreedDetailResponse,
  BreedsListResponse,
  GroupsListResponse,
} from "../../types/dog"

export const PAGE_SIZE = 48
export const FETCH_WINDOW = 2

export const breedListUrl = (pageNumber = 1) =>
  `/breeds?page[number]=${pageNumber}&page[size]=${PAGE_SIZE}`

export const breedDetailUrl = (id: string) => `/breeds/${id}`

export const groupsUrl = '/groups'

type FetchWithBQ = (url: string) => Promise<{
  data?: unknown
  error?: FetchBaseQueryError
}>

export async function assembleAllBreeds(fetchWithBQ: FetchWithBQ) {
  const merged: Breed[] = []
  let partialError = false

  const first = await fetchWithBQ(breedListUrl(1))
  if (first.error) {
    return { error: first.error }
  }

  const firstPage = first.data as BreedsListResponse
  merged.push(...(firstPage.data ?? []))
  const lastPage = firstPage.meta?.pagination?.last ?? 6

  for (let start = 2; start <= lastPage; start += FETCH_WINDOW) {
    const pages = Array.from(
      { length: FETCH_WINDOW },
      (_, index) => start + index,
    ).filter(page => page <= lastPage)

    const results = await Promise.all(
      pages.map(page => fetchWithBQ(breedListUrl(page))),
    )

    for (const result of results) {
      if (result.error) {
        partialError = true
        continue
      }
      merged.push(...((result.data as BreedsListResponse).data ?? []))
    }
  }

  const unique = new Map(merged.map(breed => [breed.id, breed]))
  return {
    data: {
      breeds: [...unique.values()],
      partialError,
    } satisfies AllBreedsResult,
  }
}

export const getdogbreedsApi = api.injectEndpoints({
  endpoints: builder => ({
    getdogbreeds: builder.query<BreedsListResponse, number>({
      query: (pageNumber = 1) => breedListUrl(pageNumber),
    }),
    getAlldogbreeds: builder.query<AllBreedsResult, void>({
      queryFn: (_arg, _api, _extraOptions, fetchWithBQ) =>
        assembleAllBreeds(url => fetchWithBQ(url)),
    }),
    getdogbreed: builder.query<BreedDetailResponse, string>({
      query: (id: string) => breedDetailUrl(id),
    }),
    getdoggroups: builder.query<GroupsListResponse, void>({
      query: () => groupsUrl,
    }),
  }),
})

export const {
  useGetdogbreedsQuery,
  useGetAlldogbreedsQuery,
  useGetdogbreedQuery,
  useGetdoggroupsQuery,
} = getdogbreedsApi
