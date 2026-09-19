import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import NetInfo from '@react-native-community/netinfo'
import type { RootScreenProps } from '../../navigation/types'
import { Paths } from '../../navigation/paths'
import {
  useGetAlldogbreedsQuery,
  useGetdoggroupsQuery,
} from '../../services/modules/dogbreed'
import type { Breed, BreedFilters } from '../../types/dog'
import {
  EMPTY_FILTERS,
  activeFilterCount,
  formatLastSynced,
  groupBreeds,
  matchesFilters,
  matchesSearch,
} from '../../utils/breeds'
import BreedRow from './BreedRow'
import FilterPanel from './FilterPanel'

const Dashboard = ({ navigation }: RootScreenProps<Paths.Dashboard>) => {
  const insets = useSafeAreaInsets()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filters, setFilters] = useState<BreedFilters>(EMPTY_FILTERS)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [isOffline, setIsOffline] = useState(false)

  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
    fulfilledTimeStamp,
  } = useGetAlldogbreedsQuery()
  const { data: groupsData, refetch: refetchGroups } = useGetdoggroupsQuery()

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(state.isConnected === false)
    })
    return () => unsubscribe()
  }, [])

  const groups = groupsData?.data ?? []
  const breeds = data?.breeds ?? []
  const filterCount = activeFilterCount(filters)

  const sections = useMemo(() => {
    const filtered = breeds.filter(
      breed =>
        matchesSearch(breed, debouncedSearch) && matchesFilters(breed, filters),
    )
    return groupBreeds(filtered, groups)
  }, [breeds, debouncedSearch, filters, groups])

  const totalVisible = useMemo(
    () => sections.reduce((sum, section) => sum + section.data.length, 0),
    [sections],
  )

  const onRefresh = useCallback(() => {
    refetch()
    refetchGroups()
  }, [refetch, refetchGroups])

  const onPressBreed = useCallback(
    (id: string) => {
      navigation.navigate(Paths.BreedDetails, { id })
    },
    [navigation],
  )

  const renderItem = useCallback(
    ({ item }: { item: Breed }) => (
      <BreedRow breed={item} onPress={onPressBreed} />
    ),
    [onPressBreed],
  )

  const showCachedError = Boolean(error) && breeds.length === 0
  const showPartialBanner = Boolean(data?.partialError) || (Boolean(error) && breeds.length > 0)

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Breed Explorer</Text>
        <Text style={styles.sync}>{formatLastSynced(fulfilledTimeStamp)}</Text>
      </View>

      {isOffline ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Offline — showing cached breeds</Text>
        </View>
      ) : null}

      {showPartialBanner ? (
        <View style={[styles.banner, styles.bannerWarn]}>
          <Text style={styles.bannerText}>
            Some pages failed to sync. Showing cached data.
          </Text>
        </View>
      ) : null}

      <View style={styles.searchWrap}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search breed name or other names"
          placeholderTextColor="#A8A29E"
          autoCorrect={false}
          autoCapitalize="none"
          style={styles.search}
        />
      </View>

      <View style={styles.filterBar}>
        <Pressable
          onPress={() => setFiltersOpen(open => !open)}
          style={styles.filterButton}>
          <Text style={styles.filterButtonText}>
            Filters{filterCount ? ` (${filterCount})` : ''}
          </Text>
        </Pressable>
        {filterCount ? (
          <Pressable onPress={() => setFilters(EMPTY_FILTERS)}>
            <Text style={styles.clear}>Clear</Text>
          </Pressable>
        ) : null}
        <Text style={styles.count}>{totalVisible} breeds</Text>
      </View>

      {filtersOpen ? (
        <FilterPanel groups={groups} filters={filters} onChange={setFilters} />
      ) : null}

      {isLoading && breeds.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#C45C26" />
          <Text style={styles.muted}>Fetching breed pages…</Text>
        </View>
      ) : showCachedError ? (
        <View style={styles.centered}>
          <Text style={styles.muted}>Could not load breeds.</Text>
          <Pressable onPress={onRefresh} style={styles.retry}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionCount}>{section.data.length}</Text>
            </View>
          )}
          stickySectionHeadersEnabled
          initialNumToRender={10}
          maxToRenderPerBatch={8}
          windowSize={8}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            totalVisible === 0 ? styles.emptyList : { paddingBottom: insets.bottom + 16 }
          }
          ListEmptyComponent={
            <Text style={styles.empty}>No breeds match these filters.</Text>
          }
          refreshControl={
            <RefreshControl
              refreshing={isFetching && breeds.length > 0}
              onRefresh={onRefresh}
              tintColor="#C45C26"
            />
          }
        />
      )}
    </View>
  )
}

export default Dashboard

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6F1EA',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1C1917',
  },
  sync: {
    marginTop: 4,
    fontSize: 13,
    color: '#78716C',
  },
  banner: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#44403C',
  },
  bannerWarn: {
    backgroundColor: '#9A3412',
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  search: {
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E0D8',
    fontSize: 16,
    color: '#1C1917',
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterButton: {
    backgroundColor: '#C45C26',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  clear: {
    color: '#C45C26',
    fontWeight: '700',
  },
  count: {
    marginLeft: 'auto',
    color: '#57534E',
    fontSize: 13,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#EDE4DA',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#44403C',
  },
  sectionCount: {
    fontSize: 12,
    color: '#78716C',
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  muted: {
    color: '#78716C',
  },
  retry: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#C45C26',
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  empty: {
    textAlign: 'center',
    color: '#78716C',
    padding: 32,
  },
})
