# Decisions

## List performance vs payload richness

The list is only 283 rows, so row count is not the bottleneck. Each breed is a nested JSON:API resource (traits, coat, origin, image variants). That makes every `SectionList` item heavier than a flat record.

Choices:

- Virtualize with `SectionList` (`windowSize={8}`, `maxToRenderPerBatch={8}`, `removeClippedSubviews`) rather than rendering all cards.
- Memoize `BreedRow` and pass a stable `onPress`.
- List thumbnails use only the `thumb` URL. Medium/large variants load on the details gallery.
- Filtering and grouping run on the already-merged in-memory dataset, not extra API calls.

## Assembling six API pages

`GET /breeds` is fetched at `page[size]=48`. Page 1 is requested first so we know `meta.pagination.last`. Remaining pages are fetched in windows of 2. Partial page failures keep whatever was merged and set `partialError` so the UI can show cached rows plus a banner.

## Offline

The RTK Query cache (breeds + groups) is persisted with redux-persist / AsyncStorage. After the first successful sync the explorer can render from cache. `refetchOnReconnect` and pull-to-refresh resync when the network returns. Freshness is shown from the query `fulfilledTimeStamp` (“Last synced 2 hours ago”).
