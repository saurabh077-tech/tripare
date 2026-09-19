import React, { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { RootScreenProps } from '../../navigation/types'
import { Paths } from '../../navigation/paths'
import {
  useGetAlldogbreedsQuery,
  useGetdogbreedQuery,
} from '../../services/modules/dogbreed'
import type { Breed, BreedImage, BreedTraits } from '../../types/dog'
import { titleCase } from '../../utils/breeds'

type Tab = 'overview' | 'traits' | 'gallery'

const TABS: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'traits', label: 'Traits' },
  { key: 'gallery', label: 'Gallery' },
]

const TRAIT_SCALES: Array<{
  key: keyof BreedTraits
  label: string
  max: number
  unit?: string
}> = [
  { key: 'energy', label: 'Energy', max: 5 },
  { key: 'barking', label: 'Barking', max: 5 },
  { key: 'drooling', label: 'Drooling', max: 5 },
  { key: 'grooming', label: 'Grooming', max: 5 },
  { key: 'shedding', label: 'Shedding', max: 5 },
  { key: 'trainability', label: 'Trainability', max: 5 },
  { key: 'good_with_dogs', label: 'Good with dogs', max: 5 },
  { key: 'exercise_minutes', label: 'Exercise minutes', max: 120, unit: 'min' },
  { key: 'apartment_friendly', label: 'Apartment friendly', max: 5 },
  { key: 'good_with_children', label: 'Good with children', max: 5 },
  { key: 'good_with_strangers', label: 'Good with strangers', max: 5 },
]

function formatRange(min?: number, max?: number, unit = '') {
  if (min == null && max == null) return '—'
  const suffix = unit ? ` ${unit}` : ''
  if (min != null && max != null) return `${min}–${max}${suffix}`
  return `${min ?? max}${suffix}`
}

function openUrl(url?: string) {
  if (!url) return
  Linking.openURL(url).catch(() => undefined)
}

const SectionCard = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    {children}
  </View>
)

const FactRow = ({ label, value }: { label: string; value?: string }) => (
  <View style={styles.factRow}>
    <Text style={styles.factLabel}>{label}</Text>
    <Text style={styles.factValue}>{value || '—'}</Text>
  </View>
)

const Chip = ({ label }: { label: string }) => (
  <Text style={styles.chip}>{label}</Text>
)

const TraitScale = ({
  label,
  value,
  max,
  unit,
}: {
  label: string
  value?: number
  max: number
  unit?: string
}) => {
  const safeValue = typeof value === 'number' ? value : 0
  const ratio = Math.max(0, Math.min(safeValue / max, 1))
  const ticks = max <= 5 ? max : 5

  return (
    <View style={styles.traitBlock}>
      <View style={styles.traitHeader}>
        <Text style={styles.traitLabel}>{label}</Text>
        <Text style={styles.traitScore}>
          {typeof value === 'number' ? `${value}${unit ? ` ${unit}` : ''}` : '—'}
          {max === 5 && typeof value === 'number' ? ` / ${max}` : ''}
        </Text>
      </View>
      <View style={styles.scaleTrack}>
        <View style={[styles.scaleFill, { width: `${ratio * 100}%` }]} />
        <View style={styles.tickRow} pointerEvents="none">
          {Array.from({ length: ticks }, (_, index) => (
            <View key={index} style={styles.tick} />
          ))}
        </View>
      </View>
    </View>
  )
}

const GallerySlide = ({
  image,
  width,
}: {
  image: BreedImage
  width: number
}) => {
  const attribution = image.attribution
  return (
    <View style={{ width }}>
      <Image
        source={{ uri: image.large || image.medium || image.url }}
        style={[styles.galleryImage, { width }]}
        resizeMode="cover"
      />
      <View style={styles.creditCard}>
        <Text style={styles.creditHeading}>Attribution</Text>
        <FactRow label="Author" value={attribution?.author} />
        <Pressable
          disabled={!attribution?.license_url}
          onPress={() => openUrl(attribution?.license_url)}>
          <FactRow
            label="License"
            value={
              attribution?.license
                ? attribution.license_url
                  ? `${attribution.license} ↗`
                  : attribution.license
                : undefined
            }
          />
        </Pressable>
        <Pressable
          disabled={!attribution?.source_url}
          onPress={() => openUrl(attribution?.source_url)}>
          <FactRow
            label="Source"
            value={
              attribution?.source
                ? attribution.source_url
                  ? `${attribution.source} ↗`
                  : attribution.source
                : undefined
            }
          />
        </Pressable>
      </View>
    </View>
  )
}

const BreedDetails = ({ navigation, route }: RootScreenProps<Paths.BreedDetails>) => {
  const { id } = route.params
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const [tab, setTab] = useState<Tab>('overview')
  const [galleryIndex, setGalleryIndex] = useState(0)

  const { breed: cached } = useGetAlldogbreedsQuery(undefined, {
    selectFromResult: ({ data }) => ({
      breed: data?.breeds.find(item => item.id === id),
    }),
  })
  const { data, isFetching, error } = useGetdogbreedQuery(id)
  const breed: Breed | undefined = data?.data ?? cached
  const images = breed?.attributes.images ?? []

  const onGalleryScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / width)
      setGalleryIndex(index)
    },
    [width],
  )

  const overview = useMemo(() => {
    if (!breed) return null
    const { attributes } = breed
    return {
      description: attributes.description?.trim() || '',
      life: formatRange(attributes.life?.min, attributes.life?.max, 'years'),
      maleWeight: formatRange(
        attributes.male_weight?.min,
        attributes.male_weight?.max,
        'kg',
      ),
      femaleWeight: formatRange(
        attributes.female_weight?.min,
        attributes.female_weight?.max,
        'kg',
      ),
      maleHeight: formatRange(
        attributes.male_height?.min,
        attributes.male_height?.max,
        'cm',
      ),
      femaleHeight: formatRange(
        attributes.female_height?.min,
        attributes.female_height?.max,
        'cm',
      ),
      origin: attributes.origin,
      otherNames: attributes.other_names ?? [],
      clubs: attributes.recognized_by ?? [],
    }
  }, [breed])

  if (!breed || !overview) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top }]}>
        {isFetching ? (
          <ActivityIndicator color="#C45C26" />
        ) : (
          <Text style={styles.muted}>
            {error ? 'Could not load this breed.' : 'Breed not found.'}
          </Text>
        )}
      </View>
    )
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.nav}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.back}>Back</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {breed.attributes.name}
        </Text>
        <View style={styles.navSpacer} />
      </View>

      <View style={styles.tabs}>
        {TABS.map(item => (
          <Pressable
            key={item.key}
            onPress={() => setTab(item.key)}
            style={[styles.tab, tab === item.key && styles.tabActive]}>
            <Text style={[styles.tabLabel, tab === item.key && styles.tabLabelActive]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === 'overview' ? (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 24 },
          ]}>
          <SectionCard title="Description">
            <Text style={styles.body}>
              {overview.description || 'No description available.'}
            </Text>
          </SectionCard>

          <SectionCard title="Life span">
            <Text style={styles.stat}>{overview.life}</Text>
          </SectionCard>

          <SectionCard title="Weight & height">
            <View style={styles.split}>
              <View style={styles.splitCol}>
                <Text style={styles.splitHeading}>Male</Text>
                <Text style={styles.statSmall}>{overview.maleWeight}</Text>
                <Text style={styles.statSmall}>{overview.maleHeight}</Text>
              </View>
              <View style={styles.splitCol}>
                <Text style={styles.splitHeading}>Female</Text>
                <Text style={styles.statSmall}>{overview.femaleWeight}</Text>
                <Text style={styles.statSmall}>{overview.femaleHeight}</Text>
              </View>
            </View>
          </SectionCard>

          <SectionCard title="Origin">
            <FactRow label="Era" value={titleCase(overview.origin?.era ?? '')} />
            <FactRow label="Region" value={overview.origin?.region} />
            <FactRow label="Country" value={overview.origin?.country} />
          </SectionCard>

          <SectionCard title="Other names">
            {overview.otherNames.length ? (
              <View style={styles.chips}>
                {overview.otherNames.map(name => (
                  <Chip key={name} label={name} />
                ))}
              </View>
            ) : (
              <Text style={styles.muted}>None listed.</Text>
            )}
          </SectionCard>

          <SectionCard title="Recognizing kennel clubs">
            {overview.clubs.length ? (
              <View style={styles.chips}>
                {overview.clubs.map(club => (
                  <Chip key={club} label={club} />
                ))}
              </View>
            ) : (
              <Text style={styles.muted}>None listed.</Text>
            )}
          </SectionCard>
        </ScrollView>
      ) : null}

      {tab === 'traits' ? (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 24 },
          ]}>
          <SectionCard title="Trait scores">
            {TRAIT_SCALES.map(item => (
              <TraitScale
                key={item.key}
                label={item.label}
                value={breed.attributes.traits?.[item.key] as number | undefined}
                max={item.max}
                unit={item.unit}
              />
            ))}
          </SectionCard>

          <SectionCard title="Temperament">
            {breed.attributes.traits?.temperament?.length ? (
              <View style={styles.chips}>
                {breed.attributes.traits.temperament.map(tag => (
                  <Chip key={tag} label={tag} />
                ))}
              </View>
            ) : (
              <Text style={styles.muted}>No temperament tags.</Text>
            )}
          </SectionCard>
        </ScrollView>
      ) : null}

      {tab === 'gallery' ? (
        images.length === 0 ? (
          <Text style={styles.empty}>No photos for this breed yet.</Text>
        ) : (
          <View style={styles.galleryWrap}>
            <FlatList
              data={images}
              keyExtractor={item => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onGalleryScroll}
              getItemLayout={(_, index) => ({
                length: width,
                offset: width * index,
                index,
              })}
              renderItem={({ item }) => <GallerySlide image={item} width={width} />}
            />
            <Text style={[styles.pager, { paddingBottom: insets.bottom + 8 }]}>
              {galleryIndex + 1} / {images.length}
            </Text>
          </View>
        )
      ) : null}
    </View>
  )
}

export default BreedDetails

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6F1EA',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  back: {
    color: '#C45C26',
    fontWeight: '700',
    width: 56,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1917',
  },
  navSpacer: {
    width: 56,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#EDE4DA',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
  },
  tabLabel: {
    fontWeight: '700',
    color: '#78716C',
  },
  tabLabelActive: {
    color: '#C45C26',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7E0D8',
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#78716C',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#292524',
  },
  stat: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1C1917',
  },
  statSmall: {
    fontSize: 15,
    fontWeight: '700',
    color: '#292524',
    marginTop: 4,
  },
  split: {
    flexDirection: 'row',
    gap: 12,
  },
  splitCol: {
    flex: 1,
    backgroundColor: '#F6F1EA',
    borderRadius: 12,
    padding: 12,
  },
  splitHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#78716C',
    textTransform: 'uppercase',
  },
  factRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 6,
  },
  factLabel: {
    color: '#78716C',
    fontWeight: '600',
  },
  factValue: {
    flex: 1,
    textAlign: 'right',
    color: '#1C1917',
    fontWeight: '700',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#F3E4D6',
    color: '#7C4A2D',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
    fontWeight: '700',
  },
  traitBlock: {
    marginBottom: 16,
  },
  traitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  traitLabel: {
    fontWeight: '700',
    color: '#44403C',
  },
  traitScore: {
    color: '#C45C26',
    fontWeight: '800',
  },
  scaleTrack: {
    height: 14,
    borderRadius: 999,
    backgroundColor: '#EDE4DA',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  scaleFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#C45C26',
    borderRadius: 999,
  },
  tickRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    height: 14,
  },
  tick: {
    width: 2,
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  galleryWrap: {
    flex: 1,
  },
  galleryImage: {
    height: 380,
    backgroundColor: '#E8DED3',
  },
  creditCard: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7E0D8',
  },
  creditHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#78716C',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  pager: {
    textAlign: 'center',
    fontWeight: '700',
    color: '#78716C',
  },
  empty: {
    padding: 24,
    textAlign: 'center',
    color: '#78716C',
  },
  muted: {
    color: '#78716C',
  },
})
