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

export type PackagesSearchVariables = {
  query?: string
}

export type PackagesSearchResponse = NonNullableObject<
  Database['public']['Functions']['search_packages']['Returns']
>

export async function searchPackages(
  {
    handle,
    partialName,
  }: {
    handle?: string
    partialName?: string
  },
  signal?: AbortSignal
) {
  let query = supabase.rpc('search_packages', {
    handle,
    partial_name: partialName,
  })

  if (signal) {
    query = query.abortSignal(signal)
  }

  const { data, error } = await query.returns<PackagesSearchResponse>()

  if (error) {
    throw error
  }

  return data ?? []
}

export type PackagesSearchData = Awaited<ReturnType<typeof searchPackages>>
export type PackagesSearchError = PostgrestError

export const usePackagesSearchQuery = <TData = PackagesSearchData>(
  { query }: PackagesSearchVariables,
  {
    enabled,
    ...options
  }: Omit<
    UseQueryOptions<PackagesSearchData, PackagesSearchError, TData>,
    'queryKey' | 'queryFn'
  > = {}
) => {
  const { handle, partialName } = parseSearchQuery(query)

  return useQuery<PackagesSearchData, PackagesSearchError, TData>({
    queryKey: ['packages', { type: 'search', handle, partialName }],
    queryFn: ({ signal }) => searchPackages({ handle, partialName }, signal),
    enabled:
      enabled &&
      (typeof handle !== 'undefined' || typeof partialName !== 'undefined'),
    ...options,
  })
}

export const prefetchPackagesSearch = (
  client: QueryClient,
  { query }: PackagesSearchVariables
) => {
  const { handle, partialName } = parseSearchQuery(query)

  return client.prefetchQuery({
    queryKey: ['packages', { type: 'search', handle, partialName }],
    queryFn: ({ signal }) => searchPackages({ handle, partialName }, signal),
  })
}

export const usePackagesSearchPrefetch = ({
  query,
}: PackagesSearchVariables) => {
  const client = useQueryClient()

  return useCallback(() => {
    prefetchPackagesSearch(client, { query })
  }, [client, query])
}

export function parseSearchQuery(query?: string) {
  let [handle, partialName] =
    query?.trim().split('/') ?? ([] as (string | undefined)[])

  // If the user only entered a partial name, then we'll search for that
  if (handle && !handle.startsWith('@') && !partialName) {
    partialName = handle
    handle = undefined
  }

  // Remove optional leading @ from handle
  handle = handle?.replace(/^@/, '')

  return {
    handle: handle?.trim() ?? undefined,
    partialName: partialName?.trim() ?? undefined,
  }
}
