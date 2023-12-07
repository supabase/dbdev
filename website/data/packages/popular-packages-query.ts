import { PostgrestError } from '@supabase/supabase-js'
import {
  QueryClient,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query'
import { useCallback } from 'react'
import supabase from '~/lib/supabase'
import { Package } from './package-query'

const SELECTED_COLUMNS = [
  'id',
  'new_package_name',
  'handle',
  'partial_name',
  'latest_version',
  'control_description',
] as const

export type PopularPackagesResponse = Pick<
  Package,
  (typeof SELECTED_COLUMNS)[number]
>[]

export async function getPopularPackages(signal?: AbortSignal) {
  let query = supabase
    .rpc('popular_packages')
    .select(SELECTED_COLUMNS.join(','))
    .limit(9)

  if (signal) {
    query = query.abortSignal(signal)
  }

  const { data, error } = await query.returns<PopularPackagesResponse>()

  if (error) {
    throw error
  }

  return data ?? []
}

export type PopularPackagesData = Awaited<ReturnType<typeof getPopularPackages>>
export type PopularPackagesError = PostgrestError

export const usePopularPackagesQuery = <TData = PopularPackagesData>({
  enabled = true,
  ...options
}: UseQueryOptions<PopularPackagesData, PopularPackagesError, TData> = {}) =>
  useQuery<PopularPackagesData, PopularPackagesError, TData>(
    ['popular-packages'],
    ({ signal }) => getPopularPackages(signal),
    {
      enabled,
      ...options,
    }
  )

export const prefetchPopularPackages = (client: QueryClient) => {
  return client.prefetchQuery(['popular-packages'], ({ signal }) =>
    getPopularPackages(signal)
  )
}

export const usePopularPackagesPrefetch = () => {
  const client = useQueryClient()

  return useCallback(() => {
    prefetchPopularPackages(client)
  }, [client])
}
