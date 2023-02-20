import { PostgrestError } from '@supabase/supabase-js'
import {
  QueryClient,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query'
import { useCallback } from 'react'
import supabase from '~/lib/supabase'

export type PackagesVariables = {
  handle?: string
}

export type PackagesResponse = {
  id: string
  handle: string
  created_at: string
  package_name: string
  partial_name: string
}[]

export async function getPackages(
  { handle }: PackagesVariables,
  signal?: AbortSignal
) {
  if (!handle) {
    throw new Error('handle is required')
  }

  let query = supabase.from('packages').select('*').eq('handle', handle)

  if (signal) {
    query = query.abortSignal(signal)
  }

  const { data, error } = await query.returns<PackagesResponse>()

  if (error) {
    throw error
  }

  return data ?? []
}

export type PackagesData = Awaited<ReturnType<typeof getPackages>>
export type PackagesError = PostgrestError

export const usePackagesQuery = <TData = PackagesData>(
  { handle }: PackagesVariables,
  {
    enabled = true,
    ...options
  }: UseQueryOptions<PackagesData, PackagesError, TData> = {}
) =>
  useQuery<PackagesData, PackagesError, TData>(
    ['packages', handle],
    ({ signal }) => getPackages({ handle }, signal),
    {
      enabled: enabled && typeof handle !== 'undefined',
      ...options,
    }
  )

export const prefetchPackages = (
  client: QueryClient,
  { handle }: PackagesVariables
) => {
  return client.prefetchQuery(['packages', handle], ({ signal }) =>
    getPackages({ handle }, signal)
  )
}

export const usePackagesPrefetch = ({ handle }: PackagesVariables) => {
  const client = useQueryClient()

  return useCallback(() => {
    if (handle) {
      prefetchPackages(client, { handle })
    }
  }, [client, handle])
}
