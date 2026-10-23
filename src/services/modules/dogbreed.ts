
import { api } from "../api";
import type {
  AllBreedsResult,
  Breed,
  BreedDetailResponse,
  BreedsListResponse,
  GroupsListResponse,
} from "../../types/dog";

const PAGE_SIZE = 48;

// Create API URLs
const breedListUrl = (page = 1) =>
  `/breeds?page[number]=${page}&page[size]=${PAGE_SIZE}`;

const breedDetailUrl = (id: string) => `/breeds/${id}`;

const groupsUrl = "/groups";

// Fetch all breeds, one page at a time
async function fetchAllBreeds(fetchWithBQ: any) {
  const allBreeds: Breed[] = [];
  let page = 1;
  let hasMore = true;
  let partialError = false;

  while (hasMore) {
    const result = await fetchWithBQ(breedListUrl(page));

    if (result.error) {
      if (page === 1) {
        return { error: result.error };
      }

      partialError = true;
      break;
    }

    const response = result.data as BreedsListResponse;

    allBreeds.push(...(response.data ?? []));

    const lastPage = response.meta?.pagination?.last ?? page;

    if (page >= lastPage) {
      hasMore = false;
    } else {
      page++;
    }
  }

  // Remove duplicate breeds using their IDs
  const uniqueBreeds = Array.from(
    new Map(allBreeds.map(breed => [breed.id, breed])).values()
  );

  return {
    data: {
      breeds: uniqueBreeds,
      partialError,
    } satisfies AllBreedsResult,
  };
}

// Define API endpoints
export const getdogbreedsApi = api.injectEndpoints({
  endpoints: builder => ({
    // Fetch one page of breeds
    getdogbreeds: builder.query<BreedsListResponse, number>({
      query: (page = 1) => breedListUrl(page),
    }),

    // Fetch all pages of breeds
    getAlldogbreeds: builder.query<AllBreedsResult, void>({
      queryFn: (_arg, _api, _extraOptions, fetchWithBQ) =>
        fetchAllBreeds(fetchWithBQ),
    }),

    // Fetch one breed by ID
    getdogbreed: builder.query<BreedDetailResponse, string>({
      query: breedDetailUrl,
    }),

    // Fetch all groups
    getdoggroups: builder.query<GroupsListResponse, void>({
      query: () => groupsUrl,
    }),
  }),
});

// Export hooks
export const {
  useGetdogbreedsQuery,
  useGetAlldogbreedsQuery,
  useGetdogbreedQuery,
  useGetdoggroupsQuery,
} = getdogbreedsApi;
