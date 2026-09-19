export type MinMax = {
  min: number
  max: number
}

export type BreedImageAttribution = {
  author?: string
  license?: string
  license_url?: string
  source?: string
  source_url?: string
}

export type BreedImage = {
  id: string
  url: string
  thumb: string
  medium: string
  large: string
  attribution?: BreedImageAttribution
}

export type BreedTraits = {
  energy?: number
  trainability?: number
  barking?: number
  grooming?: number
  shedding?: number
  drooling?: number
  good_with_children?: number
  good_with_dogs?: number
  good_with_strangers?: number
  apartment_friendly?: number
  exercise_minutes?: number
  temperament?: string[]
}

export type BreedAttributes = {
  name: string
  description?: string
  hypoallergenic?: boolean
  life?: MinMax
  male_weight?: MinMax
  female_weight?: MinMax
  male_height?: MinMax
  female_height?: MinMax
  origin?: {
    country?: string
    region?: string
    era?: string
  }
  coat?: {
    type?: string
    length?: string
    colors?: string[]
  }
  traits?: BreedTraits
  other_names?: string[]
  recognized_by?: string[]
  sources?: { url: string; title: string }[]
  images?: BreedImage[]
}

export type Breed = {
  id: string
  type: string
  attributes: BreedAttributes
  relationships?: {
    group?: {
      data?: { id: string; type: string } | null
    }
  }
}

export type Group = {
  id: string
  type: string
  attributes: {
    name: string
  }
}

export type PaginationMeta = {
  current: number
  next?: number | null
  last: number
  records: number
}

export type BreedsListResponse = {
  data: Breed[]
  meta?: { pagination?: PaginationMeta }
  links?: Record<string, string | undefined>
}

export type GroupsListResponse = {
  data: Group[]
}

export type BreedDetailResponse = {
  data: Breed
}

export type AllBreedsResult = {
  breeds: Breed[]
  partialError: boolean
}

export type SizeBand = 'small' | 'medium' | 'large' | 'giant'
export type CoatLength = 'short' | 'medium' | 'long' | 'wire'
export type TraitKey =
  | 'good_with_children'
  | 'good_with_dogs'
  | 'good_with_strangers'

export type BreedFilters = {
  groupIds: string[]
  sizeBands: SizeBand[]
  coatLengths: CoatLength[]
  hypoallergenic: Array<'yes' | 'no'>
  traitKeys: TraitKey[]
  traitMin: number
}
