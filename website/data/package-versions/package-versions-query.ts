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

export type PackageVersion = NonNullableObject<
  Database['public']['Views']['package_versions']['Row']
>

export type PackageVersionsVariables = {
  handle?: string
  partialName?: string
}

const SELECTED_COLUMNS = ['id', 'created_at', 'version'] as const

export type PackageVersionsResponse = Pick<
  PackageVersion,
  (typeof SELECTED_COLUMNS)[number]
>[]

export async function getPackageVersions(
  { handle, partialName }: PackageVersionsVariables,
  signal?: AbortSignal
) {
  if (!handle) {
    throw new Error('handle is required')
  }
  if (!partialName) {
    throw new Error('partialName is required')
  }

  let query = supabase
    .from('package_versions')
    .select(SELECTED_COLUMNS.join(','))
    .or(
      `package_name.eq.${handle}@${partialName},package_alias.eq.${handle}@${partialName}`
    )
    .order('created_at', { ascending: false })

  if (signal) {
    query = query.abortSignal(signal)
  }

  const { data, error } = await query.returns<PackageVersionsResponse>()

  if (error) {
    throw error
  }

  return data ?? []
}

export type PackageVersionsData = Awaited<ReturnType<typeof getPackageVersions>>
export type PackageVersionsError = PostgrestError

export const usePackageVersionsQuery = <TData = PackageVersionsData>(
  { handle, partialName }: PackageVersionsVariables,
  {
    enabled = true,
    ...options
  }: Omit<
    UseQueryOptions<PackageVersionsData, PackageVersionsError, TData>,
    'queryKey' | 'queryFn'
  > = {}
) =>
  useQuery<PackageVersionsData, PackageVersionsError, TData>({
    queryKey: ['package-versions', handle, partialName],
    queryFn: ({ signal }) => getPackageVersions({ handle, partialName }, signal),
    enabled:
      enabled &&
      typeof handle !== 'undefined' &&
      typeof partialName !== 'undefined',
    ...options,
  })

export const prefetchPackageVersions = (
  client: QueryClient,
  { handle, partialName }: PackageVersionsVariables
) => {
  return client.prefetchQuery({
    queryKey: ['package-versions', handle, partialName],
    queryFn: ({ signal }) => getPackageVersions({ handle, partialName }, signal),
  })
}

export const usePackageVersionsPrefetch = ({
  handle,
  partialName,
}: PackageVersionsVariables) => {
  const client = useQueryClient()

  return useCallback(() => {
    if (handle && partialName) {
      prefetchPackageVersions(client, { handle, partialName })
    }
  }, [client, handle, partialName])
}
