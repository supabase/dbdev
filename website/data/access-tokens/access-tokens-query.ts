import { PostgrestError } from '@supabase/supabase-js'
import {
  QueryClient,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query'
import { useCallback } from 'react'
import supabase from '~/lib/supabase'

export type AccessToken = {
  id: string
  token_name: string
  masked_token: string
  created_at: string
}

const SELECTED_COLUMNS = [
  'id',
  'token_name',
  'masked_token',
  'created_at',
] as const

export type AccessTokensResponse = Pick<
  AccessToken,
  (typeof SELECTED_COLUMNS)[number]
>[]

export async function getAccessTokens() {
  const { data, error } = await supabase.rpc('get_access_tokens', {})

  if (error) {
    throw error
  }

  return (data as AccessTokensResponse) ?? []
}

export const accessTokensQueryKey = 'access-tokens'

export type AccessTokensData = Awaited<ReturnType<typeof getAccessTokens>>
export type AccessTokensError = PostgrestError

export const useAccessTokensQuery = <TData = AccessTokensData>({
  enabled = true,
  ...options
}: Omit<
  UseQueryOptions<AccessTokensData, AccessTokensError, TData>,
  'queryKey' | 'queryFn'
> = {}) =>
  useQuery<AccessTokensData, AccessTokensError, TData>({
    queryKey: [accessTokensQueryKey],
    queryFn: ({}) => getAccessTokens(),
    enabled: enabled,
    ...options,
  })

export const prefetchAccessTokens = (client: QueryClient) => {
  return client.prefetchQuery({
    queryKey: [accessTokensQueryKey],
    queryFn: ({}) => getAccessTokens(),
  })
}

export const useAccessTokensPrefetch = () => {
  const client = useQueryClient()

  return useCallback(() => {
    prefetchAccessTokens(client)
  }, [client])
}
