import type {
  Breed,
  BreedFilters,
  CoatLength,
  Group,
  SizeBand,
} from '../types/dog'

export const GROUP_ORDER = [
  'Herding',
  'Hound',
  'Sporting',
  'Terrier',
  'Toy',
  'Working',
  'Non-Sporting',
  'Miscellaneous',
  'Foundation Stock Service',
] as const

export const SIZE_BANDS: SizeBand[] = ['small', 'medium', 'large', 'giant']
export const COAT_LENGTHS: CoatLength[] = ['short', 'medium', 'long', 'wire']

export const TRAIT_OPTIONS = [
  { key: 'good_with_children' as const, label: 'Good with children' },
  { key: 'good_with_dogs' as const, label: 'Good with dogs' },
  { key: 'good_with_strangers' as const, label: 'Good with strangers' },
]

export const EMPTY_FILTERS: BreedFilters = {
  groupIds: [],
  sizeBands: [],
  coatLengths: [],
  hypoallergenic: [],
  traitKeys: [],
  traitMin: 3,
}

/** Size from typical adult male max weight (kg). Height is a fallback. */
export function sizeBandForBreed(breed: Breed): SizeBand | null {
  const weight =
    breed.attributes.male_weight?.max ?? breed.attributes.female_weight?.max
  if (weight != null) {
    if (weight < 10) return 'small'
    if (weight < 25) return 'medium'
    if (weight < 45) return 'large'
    return 'giant'
  }

  const height =
    breed.attributes.male_height?.max ?? breed.attributes.female_height?.max
  if (height == null) return null
  if (height < 35) return 'small'
  if (height < 50) return 'medium'
  if (height < 65) return 'large'
  return 'giant'
}

export function coatLengthForBreed(breed: Breed): CoatLength | null {
  const length = breed.attributes.coat?.length?.toLowerCase() ?? ''
  const type = breed.attributes.coat?.type?.toLowerCase() ?? ''
  const combined = `${length} ${type}`

  if (combined.includes('wire')) return 'wire'
  if (length.includes('short')) return 'short'
  if (length.includes('long')) return 'long'
  if (length.includes('medium') || length.includes('mid')) return 'medium'
  return null
}

export function matchesSearch(breed: Breed, query: string): boolean {
  if (!query) return true
  const q = query.toLowerCase()
  if (breed.attributes.name.toLowerCase().includes(q)) return true
  return (breed.attributes.other_names ?? []).some(name =>
    name.toLowerCase().includes(q),
  )
}

export function matchesFilters(breed: Breed, filters: BreedFilters): boolean {
  if (filters.groupIds.length > 0) {
    const groupId = breed.relationships?.group?.data?.id
    if (!groupId || !filters.groupIds.includes(groupId)) return false
  }

  if (filters.sizeBands.length > 0) {
    const size = sizeBandForBreed(breed)
    if (!size || !filters.sizeBands.includes(size)) return false
  }

  if (filters.coatLengths.length > 0) {
    const coat = coatLengthForBreed(breed)
    if (!coat || !filters.coatLengths.includes(coat)) return false
  }

  if (filters.hypoallergenic.length > 0) {
    const yes = breed.attributes.hypoallergenic === true
    const wantsYes = filters.hypoallergenic.includes('yes')
    const wantsNo = filters.hypoallergenic.includes('no')
    if (!(wantsYes && yes) && !(wantsNo && !yes)) return false
  }

  if (filters.traitKeys.length > 0) {
    const traits = breed.attributes.traits
    const meets = filters.traitKeys.every(key => {
      const score = traits?.[key]
      return typeof score === 'number' && score >= filters.traitMin
    })
    if (!meets) return false
  }

  return true
}

export function activeFilterCount(filters: BreedFilters): number {
  return (
    filters.groupIds.length +
    filters.sizeBands.length +
    filters.coatLengths.length +
    filters.hypoallergenic.length +
    filters.traitKeys.length
  )
}

export type BreedSection = {
  title: string
  key: string
  data: Breed[]
}

export function groupBreeds(
  breeds: Breed[],
  groups: Group[],
): BreedSection[] {
  const groupNameById = new Map(groups.map(g => [g.id, g.attributes.name]))
  const buckets = new Map<string, Breed[]>()

  for (const breed of breeds) {
    const groupId = breed.relationships?.group?.data?.id ?? 'ungrouped'
    const list = buckets.get(groupId) ?? []
    list.push(breed)
    buckets.set(groupId, list)
  }

  const orderedIds = [...buckets.keys()].sort((a, b) => {
    const nameA = groupNameById.get(a) ?? 'Ungrouped'
    const nameB = groupNameById.get(b) ?? 'Ungrouped'
    const indexA = GROUP_ORDER.indexOf(nameA as (typeof GROUP_ORDER)[number])
    const indexB = GROUP_ORDER.indexOf(nameB as (typeof GROUP_ORDER)[number])
    const rankA = indexA === -1 ? GROUP_ORDER.length : indexA
    const rankB = indexB === -1 ? GROUP_ORDER.length : indexB
    if (rankA !== rankB) return rankA - rankB
    return nameA.localeCompare(nameB)
  })

  return orderedIds.map(id => ({
    key: id,
    title: groupNameById.get(id) ?? 'Ungrouped',
    data: (buckets.get(id) ?? []).sort((a, b) =>
      a.attributes.name.localeCompare(b.attributes.name),
    ),
  }))
}

export function formatLastSynced(timestamp?: number): string {
  if (!timestamp) return 'Not synced yet'
  const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000))
  if (minutes < 1) return 'Last synced just now'
  if (minutes === 1) return 'Last synced 1 minute ago'
  if (minutes < 60) return `Last synced ${minutes} minutes ago`
  const hours = Math.round(minutes / 60)
  if (hours === 1) return 'Last synced 1 hour ago'
  if (hours < 24) return `Last synced ${hours} hours ago`
  const days = Math.round(hours / 24)
  return days === 1 ? 'Last synced 1 day ago' : `Last synced ${days} days ago`
}

export function titleCase(value: string): string {
  return value.replace(/(^|[_-\s])(\w)/g, (_, sep, char) =>
    `${sep === '_' || sep === '-' ? ' ' : sep}${char.toUpperCase()}`,
  )
}
