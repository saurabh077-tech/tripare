import React, { memo } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import type { Breed } from '../../types/dog'
import { sizeBandForBreed, titleCase } from '../../utils/breeds'

type Props = {
  breed: Breed
  onPress: (id: string) => void
}

const BreedRow = ({ breed, onPress }: Props) => {
  const thumb = breed.attributes.images?.[0]?.thumb
  const size = sizeBandForBreed(breed)
  const otherNames = (breed.attributes.other_names ?? []).slice(0, 2).join(' · ')

  return (
    <Pressable
      onPress={() => onPress(breed.id)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      {thumb ? (
        <Image source={{ uri: thumb }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.thumbFallback]}>
          <Text style={styles.thumbLetter}>
            {breed.attributes.name.charAt(0)}
          </Text>
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {breed.attributes.name}
        </Text>
        {otherNames ? (
          <Text style={styles.alias} numberOfLines={1}>
            {otherNames}
          </Text>
        ) : null}
        <View style={styles.meta}>
          {size ? <Text style={styles.pill}>{titleCase(size)}</Text> : null}
          {breed.attributes.coat?.length ? (
            <Text style={styles.pill}>{titleCase(breed.attributes.coat.length)}</Text>
          ) : null}
          {breed.attributes.hypoallergenic ? (
            <Text style={styles.pill}>Hypoallergenic</Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  )
}

export default memo(BreedRow)

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 88,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E7E0D8',
  },
  pressed: {
    backgroundColor: '#F3EDE6',
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#E8DED3',
  },
  thumbFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbLetter: {
    fontSize: 22,
    fontWeight: '700',
    color: '#8A5A3B',
  },
  body: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1917',
  },
  alias: {
    marginTop: 2,
    fontSize: 12,
    color: '#78716C',
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  pill: {
    fontSize: 11,
    color: '#7C4A2D',
    backgroundColor: '#F3E4D6',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
})
