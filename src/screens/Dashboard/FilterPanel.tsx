import React from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import type { BreedFilters, CoatLength, Group, SizeBand, TraitKey } from '../../types/dog'
import {
  COAT_LENGTHS,
  SIZE_BANDS,
  TRAIT_OPTIONS,
  titleCase,
} from '../../utils/breeds'

type Props = {
  groups: Group[]
  filters: BreedFilters
  onChange: (next: BreedFilters) => void
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter(item => item !== value) : [...list, value]
}

const Chip = ({
  label,
  selected,
  onPress,
}: {
  label: string
  selected: boolean
  onPress: () => void
}) => (
  <Pressable
    onPress={onPress}
    style={[styles.chip, selected && styles.chipSelected]}
    accessibilityRole="button"
    accessibilityState={{ selected }}
    accessibilityLabel={`${label}${selected ? ', selected' : ''}`}>
    <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
      {label}
    </Text>
  </Pressable>
)

const FilterPanel = ({ groups, filters, onChange }: Props) => {
  return (
    <View
      style={styles.panel}
      accessibilityLabel="Breed filters"
      testID="filter-panel">
      <Text accessibilityRole="header" style={styles.section}>Breed group</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {groups.map(group => (
          <Chip
            key={group.id}
            label={group.attributes.name}
            selected={filters.groupIds.includes(group.id)}
            onPress={() =>
              onChange({
                ...filters,
                groupIds: toggle(filters.groupIds, group.id),
              })
            }
          />
        ))}
      </ScrollView>

      <Text accessibilityRole="header" style={styles.section}>Size</Text>
      <View style={styles.wrap}>
        {SIZE_BANDS.map(size => (
          <Chip
            key={size}
            label={titleCase(size)}
            selected={filters.sizeBands.includes(size)}
            onPress={() =>
              onChange({
                ...filters,
                sizeBands: toggle(filters.sizeBands, size as SizeBand),
              })
            }
          />
        ))}
      </View>

      <Text accessibilityRole="header" style={styles.section}>Coat length</Text>
      <View style={styles.wrap}>
        {COAT_LENGTHS.map(coat => (
          <Chip
            key={coat}
            label={titleCase(coat)}
            selected={filters.coatLengths.includes(coat)}
            onPress={() =>
              onChange({
                ...filters,
                coatLengths: toggle(filters.coatLengths, coat as CoatLength),
              })
            }
          />
        ))}
      </View>

      <Text accessibilityRole="header" style={styles.section}>Hypoallergenic</Text>
      <View style={styles.wrap}>
        {(['yes', 'no'] as const).map(value => (
          <Chip
            key={value}
            label={titleCase(value)}
            selected={filters.hypoallergenic.includes(value)}
            onPress={() =>
              onChange({
                ...filters,
                hypoallergenic: toggle(filters.hypoallergenic, value),
              })
            }
          />
        ))}
      </View>

      <Text accessibilityRole="header" style={styles.section}>Trait threshold</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {TRAIT_OPTIONS.map(option => (
          <Chip
            key={option.key}
            label={option.label}
            selected={filters.traitKeys.includes(option.key)}
            onPress={() =>
              onChange({
                ...filters,
                traitKeys: toggle(filters.traitKeys, option.key as TraitKey),
              })
            }
          />
        ))}
      </ScrollView>
      <Text style={styles.hint}>Minimum score {filters.traitMin}/5</Text>
      <View style={styles.wrap}>
        {[1, 2, 3, 4, 5].map(score => (
          <Chip
            key={score}
            label={String(score)}
            selected={filters.traitMin === score}
            onPress={() => onChange({ ...filters, traitMin: score })}
          />
        ))}
      </View>
    </View>
  )
}

export default FilterPanel

const styles = StyleSheet.create({
  panel: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#F6F1EA',
  },
  section: {
    marginTop: 10,
    marginBottom: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#57534E',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  row: {
    gap: 8,
    paddingRight: 16,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E0D8',
  },
  chipSelected: {
    backgroundColor: '#C45C26',
    borderColor: '#C45C26',
  },
  chipLabel: {
    fontSize: 13,
    color: '#44403C',
    fontWeight: '600',
  },
  chipLabelSelected: {
    color: '#FFFFFF',
  },
  hint: {
    marginTop: 8,
    marginBottom: 4,
    fontSize: 12,
    color: '#78716C',
  },
})
