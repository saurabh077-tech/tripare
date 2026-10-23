import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'



const baseQueryWithInterceptor: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  
  /**
   * Base Url which is used for the Base queries
   */
  const baseQuery = fetchBaseQuery({
    baseUrl: "https://dogapi.dog/api/v2",
  
    prepareHeaders: headers => {
    
      return headers
    },
  })
  let result = await baseQuery(args, api, extraOptions)
  const uniqueLogId = Math.floor(Math.random() * 90000) + 10000 + ''

  if (result.error && result.error.status === 401) {
    console.warn('401 Status in API')
  }
  console.debug('---------------------', uniqueLogId)
  return result
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithInterceptor,
  keepUnusedDataFor: 60 * 60 * 24,
  refetchOnReconnect: true,
  refetchOnFocus: true,
  endpoints: () => ({}),
})
