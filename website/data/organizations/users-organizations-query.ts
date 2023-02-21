import { PostgrestError } from '@supabase/supabase-js'
import {
  QueryClient,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query'
import { useCallback } from 'react'
import supabase from '~/lib/supabase'

export type UsersOrganizationsVariables = {
  userId?: string
}

export type UsersOrganizationsResponse = {}[]

export async function getUsersOrganizations(
  { userId }: UsersOrganizationsVariables,
  signal?: AbortSignal
) {
  if (!userId) {
    throw new Error('userId is required')
  }

  let query = supabase
    .from('organizations')
    .select('*,members!inner(*)')
    .eq('members.account_id', userId)

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
  }: UseQueryOptions<
    UsersOrganizationsData,
    UsersOrganizationsError,
    TData
  > = {}
) =>
  useQuery<UsersOrganizationsData, UsersOrganizationsError, TData>(
    ['users', userId, 'organizations'],
    ({ signal }) => getUsersOrganizations({ userId }, signal),
    {
      enabled: enabled && typeof userId !== 'undefined',
      ...options,
    }
  )

export const prefetchUsersOrganizations = (
  client: QueryClient,
  { userId }: UsersOrganizationsVariables
) => {
  return client.prefetchQuery(
    ['users', userId, 'organizations'],
    ({ signal }) => getUsersOrganizations({ userId }, signal)
  )
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
