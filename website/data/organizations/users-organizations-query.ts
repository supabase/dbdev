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

export type UsersOrganizationsVariables = {
  userId?: string
}

export type UsersOrganizationsResponse = NonNullableObject<
  Database['public']['Views']['organizations']['Row']
>[]

export async function getUsersOrganizations(
  { userId }: UsersOrganizationsVariables,
  signal?: AbortSignal
) {
  if (!userId) {
    throw new Error('userId is required')
  }

  let query = supabase
    .from('organizations')
    .select('*,members!inner(account_id)')
    .eq('members.account_id', userId)
    .order('created_at', { ascending: false })

  if (signal) {
    query = query.abortSignal(signal)
  }

  const { data, error } = await query.returns<UsersOrganizationsResponse>()

  if (error) {
    throw error
  }

  return data ?? []
}

export type UsersOrganizationsData = Awaited<
  ReturnType<typeof getUsersOrganizations>
>
export type UsersOrganizationsError = PostgrestError

export const useUsersOrganizationsQuery = <TData = UsersOrganizationsData>(
  { userId }: UsersOrganizationsVariables,
  {
    enabled = true,
    ...options
  }: Omit<
    UseQueryOptions<UsersOrganizationsData, UsersOrganizationsError, TData>,
    'queryKey' | 'queryFn'
  > = {}
) =>
  useQuery<UsersOrganizationsData, UsersOrganizationsError, TData>({
    queryKey: ['users', userId, 'organizations'],
    queryFn: ({ signal }) => getUsersOrganizations({ userId }, signal),
    enabled: enabled && typeof userId !== 'undefined',
    ...options,
  })

export const prefetchUsersOrganizations = (
  client: QueryClient,
  { userId }: UsersOrganizationsVariables
) => {
  return client.prefetchQuery({
    queryKey: ['users', userId, 'organizations'],
    queryFn: ({ signal }) => getUsersOrganizations({ userId }, signal),
  })
}

export const useUsersOrganizationsPrefetch = ({
  userId,
}: UsersOrganizationsVariables) => {
  const client = useQueryClient()

  return useCallback(() => {
    if (userId) {
      prefetchUsersOrganizations(client, { userId })
    }
  }, [client, userId])
}
