import { PostgrestError } from '@supabase/supabase-js'
import {
  QueryClient,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query'
import { useCallback } from 'react'
import supabase from '~/lib/supabase'
import { NonNullableObject } from '~/lib/types'
import { Database } from '../database.types'

export type AccessToken = NonNullableObject<
  Database['public']['Views']['access_tokens']['Row']
>

const SELECTED_COLUMNS = ['id', 'token_name', 'created_at'] as const

export type AccessTokensResponse = Pick<
  AccessToken,
  (typeof SELECTED_COLUMNS)[number]
>[]

export async function getAccessTokens(
  signal?: AbortSignal
) {

  let query = supabase
    .from('access_tokens')
    .select(SELECTED_COLUMNS.join(','))
    .order('created_at', { ascending: false })

  if (signal) {
    query = query.abortSignal(signal)
  }

  const { data, error } = await query.returns<AccessTokensResponse>()

  if (error) {
    throw error
  }

  return data ?? []
}

export type AccessTokensData = Awaited<ReturnType<typeof getAccessTokens>>
export type AccessTokensError = PostgrestError

export const useAccessTokensQuery = <TData = AccessTokensData>(
  {
    enabled = true,
    ...options
  }: UseQueryOptions<AccessTokensData, AccessTokensError, TData> = {}
) =>
  useQuery<AccessTokensData, AccessTokensError, TData>(
    ['access-tokens'],
    ({ signal }) => getAccessTokens(signal),
    {
      enabled:
        enabled,
      ...options,
    }
  )

export const prefetchAccessTokens = (
  client: QueryClient
) => {
  return client.prefetchQuery(
    ['access-tokens'],
    ({ signal }) => getAccessTokens(signal)
  )
}

export const useAccessTokensPrefetch = () => {
  const client = useQueryClient()

  return useCallback(() => {
      prefetchAccessTokens(client)
  }, [client])
}

