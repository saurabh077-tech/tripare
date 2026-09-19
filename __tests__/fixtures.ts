import type { Breed, Group } from '../src/types/dog'
import { EMPTY_FILTERS } from '../src/utils/breeds'

export const herdingGroup: Group = {
  id: 'group-herding',
  type: 'group',
  attributes: { name: 'Herding' },
}

export const toyGroup: Group = {
  id: 'group-toy',
  type: 'group',
  attributes: { name: 'Toy' },
}

export function makeBreed(overrides: Partial<Breed> & { id: string; name: string }): Breed {
  const { id, name, ...rest } = overrides
  return {
    id,
    type: 'breed',
    attributes: {
      name,
      description: `${name} description`,
      hypoallergenic: false,
      male_weight: { min: 20, max: 30 },
      female_weight: { min: 18, max: 28 },
      coat: { length: 'short', type: 'smooth' },
      other_names: [],
      traits: {
        energy: 3,
        barking: 3,
        drooling: 2,
        grooming: 2,
        shedding: 3,
        trainability: 4,
        good_with_dogs: 4,
        exercise_minutes: 45,
        apartment_friendly: 3,
        good_with_children: 4,
        good_with_strangers: 3,
        temperament: ['loyal'],
      },
      images: [
        {
          id: `${id}-img`,
          url: 'https://example.com/dog.jpg',
          thumb: 'https://example.com/dog-thumb.webp',
          medium: 'https://example.com/dog-medium.webp',
          large: 'https://example.com/dog-large.webp',
          attribution: {
            author: 'Jane Doe',
            license: 'CC BY 4.0',
            license_url: 'https://creativecommons.org/licenses/by/4.0/',
            source: 'wikimedia_commons',
            source_url: 'https://commons.wikimedia.org/',
          },
        },
      ],
      ...rest.attributes,
    },
    relationships: {
      group: { data: { id: herdingGroup.id, type: 'group' } },
      ...rest.relationships,
    },
  }
}

export const borderCollie = makeBreed({
  id: 'breed-collie',
  name: 'Border Collie',
  attributes: {
    name: 'Border Collie',
    other_names: ['Scotch Sheep Dog'],
    hypoallergenic: false,
    male_weight: { min: 14, max: 20 },
    coat: { length: 'medium', type: 'double' },
    traits: {
      good_with_children: 5,
      good_with_dogs: 4,
      good_with_strangers: 3,
      energy: 5,
    },
  },
})

export const chihuahua = makeBreed({
  id: 'breed-chi',
  name: 'Chihuahua',
  attributes: {
    name: 'Chihuahua',
    other_names: ['Chi'],
    hypoallergenic: true,
    male_weight: { min: 1.5, max: 3 },
    coat: { length: 'short', type: 'smooth' },
    traits: {
      good_with_children: 2,
      good_with_dogs: 2,
      good_with_strangers: 1,
    },
  },
  relationships: {
    group: { data: { id: toyGroup.id, type: 'group' } },
  },
})

export const emptyFilters = { ...EMPTY_FILTERS }
