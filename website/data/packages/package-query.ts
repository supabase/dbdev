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
import { NotFoundError } from '../utils'

export type PackageVariables = {
  handle?: string
  partialName?: string
}

export type Package = NonNullableObject<
  Database['public']['Views']['packages']['Row']
>

export type PackageResponse = Package & {
  download_metrics: {
    package_id: string
    downloads_30_day: number
    downloads_90_days: number
    downloads_180_days: number
    downloads_all_time: number
  } | null
}

export async function getPackage(
  { handle, partialName }: PackageVariables,
  signal?: AbortSignal
) {
  if (!handle) {
    throw new Error('handle is required')
  }
  if (!partialName) {
    throw new Error('partialName is required')
  }

  let query = supabase
    .from('packages')
    .select('*,download_metrics(*)')
    .eq('handle', handle)
    .eq('partial_name', partialName)

  if (signal) {
    query = query.abortSignal(signal)
  }

  const { data, error } = await query.maybeSingle<PackageResponse>()

  if (error) {
    throw error
  }

  if (!data) {
    throw new NotFoundError('Package not found')
  }

  return data
}

export type PackageData = Awaited<ReturnType<typeof getPackage>>
export type PackageError = PostgrestError | NotFoundError

export const usePackageQuery = <TData = PackageData>(
  { handle, partialName }: PackageVariables,
  {
    enabled = true,
    ...options
  }: Omit<
    UseQueryOptions<PackageData, PackageError, TData>,
    'queryKey' | 'queryFn'
  > = {}
) =>
  useQuery<PackageData, PackageError, TData>({
    queryKey: ['package', handle, partialName],
    queryFn: ({ signal }) => getPackage({ handle, partialName }, signal),
    enabled:
      enabled &&
      typeof handle !== 'undefined' &&
      typeof partialName !== 'undefined',
    ...options,
  })

export const prefetchPackage = (
  client: QueryClient,
  { handle, partialName }: PackageVariables
) => {
  return client.prefetchQuery({
    queryKey: ['package', handle, partialName],
    queryFn: ({ signal }) => getPackage({ handle, partialName }, signal),
  })
}

export const usePackagePrefetch = ({
  handle,
  partialName,
}: PackageVariables) => {
  const client = useQueryClient()

  return useCallback(() => {
    if (handle && partialName) {
      prefetchPackage(client, { handle, partialName })
    }
  }, [client, handle, partialName])
}
