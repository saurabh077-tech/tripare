import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'

// const baseQuery = fetchBaseQuery({
//   baseUrl: Config.CAMPUS_API_URL,
// })

const baseQueryWithInterceptor: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  /**
   * Brand Url which i am setting in Login Submit Function
   */
  const brandUrl = await AsyncStorage.getItem('brandUrl')
  const user = await AsyncStorage.getItem('user')

  // console.log('brnad', brandUrl, user)
  /**
   * If Brand Url Exists then set the brand url or else use the campus url
   * Base Url which is used for the Base queries
   */
  const baseQuery = fetchBaseQuery({
    // baseUrl: brandUrl ? brandUrl + 'api/Webservice/' : Config.CAMPUS_API_URL,
    // baseUrl: brandUrl
    //   ? 'https://newui.campus365.io/' + 'api/Webservice/'
    //   : Config.CAMPUS_API_URL,
    prepareHeaders: headers => {
      // console.log('getState', (getState() as RootState).brand.user.token)
      headers.set('auth-key', 'schoolAdmin@')
      headers.set('client-service', 'smartschool')
      console.log('headers', headers)

      return headers
    },
  })
  let result = await baseQuery(args, api, extraOptions)
  const uniqueLogId = Math.floor(Math.random() * 90000) + 10000 + ''
  console.debug('---------------------', uniqueLogId)
  console.debug('apiRequest: ', args)
  console.debug('apiResult:', result)
  //console.debug('apiResult:', JSON.stringify(result, null, 2));
  if (result.error && result.error.status === 401) {
    console.warn('401 Status in API')
  }
  console.debug('---------------------', uniqueLogId)
  return result
}

export const api = createApi({
  baseQuery: baseQueryWithInterceptor,
  endpoints: () => ({}),
})
