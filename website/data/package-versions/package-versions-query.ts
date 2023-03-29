import { PostgrestError } from '@supabase/supabase-js'
import {
  QueryClient,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query'
import { useCallback } from 'react'
import supabase from '~/lib/supabase'

export type PackageVersionsVariables = {
  handle?: string
  partialName?: string
}

export type PackageVersionsResponse = {
  id: string
  created_at: string
  package_id: string
  package_name: string
  version: string
  object_id: string
  object_key: string
  upload_metadata: { [key: string]: any }
}[]

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
    .select('*')
    .eq('package_name', `${handle}/${partialName}`)

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
  }: UseQueryOptions<PackageVersionsData, PackageVersionsError, TData> = {}
) =>
  useQuery<PackageVersionsData, PackageVersionsError, TData>(
    ['package-versions', handle, partialName],
    ({ signal }) => getPackageVersions({ handle, partialName }, signal),
    {
      enabled:
        enabled &&
        typeof handle !== 'undefined' &&
        typeof partialName !== 'undefined',
      ...options,
    }
  )

export const prefetchPackageVersions = (
  client: QueryClient,
  { handle, partialName }: PackageVersionsVariables
) => {
  return client.prefetchQuery(
    ['package-versions', handle, partialName],
    ({ signal }) => getPackageVersions({ handle, partialName }, signal)
  )
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
