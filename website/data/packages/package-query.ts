import { PostgrestError } from '@supabase/supabase-js'
import {
  QueryClient,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query'
import { useCallback } from 'react'
import supabase from '~/lib/supabase'
import { NotFoundError } from '../utils'

export type PackageVariables = {
  handle?: string
  partialName?: string
}

export type PackageResponse = {
  id: string
  handle: string
  created_at: string
  package_name: string
  partial_name: string
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
    .select('*')
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
  }: UseQueryOptions<PackageData, PackageError, TData> = {}
) =>
  useQuery<PackageData, PackageError, TData>(
    ['package', handle, partialName],
    ({ signal }) => getPackage({ handle, partialName }, signal),
    {
      enabled:
        enabled &&
        typeof handle !== 'undefined' &&
        typeof partialName !== 'undefined',
      ...options,
    }
  )

export const prefetchPackage = (
  client: QueryClient,
  { handle, partialName }: PackageVariables
) => {
  return client.prefetchQuery(['package', handle, partialName], ({ signal }) =>
    getPackage({ handle, partialName }, signal)
  )
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
