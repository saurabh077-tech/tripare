import React from 'react'
import { Text } from 'react-native'
import ReactTestRenderer from 'react-test-renderer'
import Dashboard from '../src/screens/Dashboard/Dashboard'
import { Paths } from '../src/navigation/paths'
import {
  EMPTY_FILTERS,
  groupBreeds,
  matchesFilters,
  matchesSearch,
  sizeBandForBreed,
} from '../src/utils/breeds'
import {
  borderCollie,
  chihuahua,
  herdingGroup,
  toyGroup,
} from './fixtures'
import {
  useGetAlldogbreedsQuery,
  useGetdoggroupsQuery,
} from '../src/services/modules/dogbreed'

jest.mock('../src/services/modules/dogbreed', () => ({
  useGetAlldogbreedsQuery: jest.fn(),
  useGetdoggroupsQuery: jest.fn(),
}))

const mockedBreeds = useGetAlldogbreedsQuery as jest.Mock
const mockedGroups = useGetdoggroupsQuery as jest.Mock

function collectText(tree: ReactTestRenderer.ReactTestRenderer) {
  return tree.root
    .findAllByType(Text)
    .map(node =>
      Array.isArray(node.props.children)
        ? node.props.children.join('')
        : String(node.props.children ?? ''),
    )
    .join(' ')
}

function renderDashboard() {
  const navigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  }
  let tree: ReactTestRenderer.ReactTestRenderer
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <Dashboard
        navigation={navigation as never}
        route={{ key: 'dash', name: Paths.Dashboard } as never}
      />,
    )
  })
  return { tree: tree!, navigation }
}

describe('breed list filtering and grouping', () => {
  it('searches by breed name and other_names', () => {
    expect(matchesSearch(borderCollie, 'border')).toBe(true)
    expect(matchesSearch(borderCollie, 'sheep')).toBe(true)
    expect(matchesSearch(borderCollie, 'poodle')).toBe(false)
  })

  it('derives size bands from weight', () => {
    expect(sizeBandForBreed(chihuahua)).toBe('small')
    expect(sizeBandForBreed(borderCollie)).toBe('medium')
  })

  it('filters by group, size, coat, hypoallergenic, and trait threshold', () => {
    const filters = {
      ...EMPTY_FILTERS,
      groupIds: [herdingGroup.id],
      sizeBands: ['medium' as const],
      coatLengths: ['medium' as const],
      hypoallergenic: ['no' as const],
      traitKeys: ['good_with_children' as const],
      traitMin: 4,
    }
    expect(matchesFilters(borderCollie, filters)).toBe(true)
    expect(matchesFilters(chihuahua, filters)).toBe(false)
  })

  it('groups breeds by breed group in display order', () => {
    const sections = groupBreeds(
      [chihuahua, borderCollie],
      [herdingGroup, toyGroup],
    )
    expect(sections.map(section => section.title)).toEqual(['Herding', 'Toy'])
    expect(sections[0].data[0].attributes.name).toBe('Border Collie')
  })
})

describe('Breed Explorer list screen', () => {
  beforeEach(() => {
    mockedGroups.mockReturnValue({
      data: { data: [herdingGroup, toyGroup] },
      refetch: jest.fn(),
    })
  })

  it('renders grouped breed rows from the merged API dataset', () => {
    mockedBreeds.mockReturnValue({
      data: { breeds: [borderCollie, chihuahua], partialError: false },
      error: undefined,
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
      fulfilledTimeStamp: Date.now(),
    })

    const { tree } = renderDashboard()
    const text = collectText(tree)
    expect(text).toContain('Breed Explorer')
    const search = tree.root.findByProps({ testID: 'search-input' })
    expect(search.props.accessibilityRole).toBe('search')
    expect(search.props.accessibilityLabel).toBe(
      'Search breed name or other names',
    )
    expect(text).toContain('Border Collie')
    expect(text).toContain('Chihuahua')
    expect(text).toContain('Herding')
    expect(text).toContain('Toy')
    expect(text).toContain('2 breeds')
  })

  it('shows a retry state when the API fails with no cached rows', () => {
    mockedBreeds.mockReturnValue({
      data: undefined,
      error: { status: 500 },
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
      fulfilledTimeStamp: undefined,
    })

    const { tree } = renderDashboard()
    const text = collectText(tree)
    expect(text).toContain('Could not load breeds.')
    expect(text).toContain('Retry')
  })

  it('navigates to details when a breed row is pressed', () => {
    mockedBreeds.mockReturnValue({
      data: { breeds: [borderCollie], partialError: false },
      error: undefined,
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
      fulfilledTimeStamp: Date.now(),
    })

    const { tree, navigation } = renderDashboard()
    const row = tree.root.findByProps({ testID: 'breed-row-breed-collie' })
    expect(row.props.accessibilityRole).toBe('button')
    expect(row.props.accessibilityLabel).toContain('Border Collie')
    ReactTestRenderer.act(() => {
      row.props.onPress()
    })
    expect(navigation.navigate).toHaveBeenCalledWith(Paths.BreedDetails, {
      id: 'breed-collie',
    })
  })
})
