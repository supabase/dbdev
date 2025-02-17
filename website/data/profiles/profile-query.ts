import { PostgrestError } from '@supabase/supabase-js'
import {
  QueryClient,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query'
import { useCallback } from 'react'
import { getAvatarUrl } from '~/lib/avatars'
import supabase from '~/lib/supabase'
import { NotFoundError } from '../utils'

export type ProfileVariables = {
  handle?: string
}

export async function getProfile(
  { handle }: ProfileVariables,
  signal?: AbortSignal
) {
  if (!handle) {
    throw new Error('handle is required')
  }

  let accountQuery = supabase.rpc('get_account', { handle })
  let organizationQuery = supabase.rpc('get_organization', { handle })

  if (signal) {
    accountQuery = accountQuery.abortSignal(signal)
    organizationQuery = organizationQuery.abortSignal(signal)
  }

  const [
    { data: account, error: accountError },
    { data: organization, error: organizationError },
  ] = await Promise.all([
    accountQuery.maybeSingle(),
    organizationQuery.maybeSingle(),
  ])

  if (accountError) {
    throw accountError
  }

  if (organizationError) {
    throw organizationError
  }

  if (organization) {
    const avatar_url = getAvatarUrl(organization.avatar_path)

    return { ...organization, type: 'organization' as const, avatar_url }
  }

  if (account) {
    const avatar_url = getAvatarUrl(account.avatar_path)

    return { ...account, type: 'account' as const, avatar_url }
  }

  throw new NotFoundError('Account or organization not found')
}

export type ProfileData = Awaited<ReturnType<typeof getProfile>>
export type ProfileError = PostgrestError | NotFoundError

export const useProfileQuery = <TData = ProfileData>(
  { handle }: ProfileVariables,
  {
    enabled = true,
    ...options
  }: UseQueryOptions<ProfileData, ProfileError, TData> = {}
) =>
  useQuery<ProfileData, ProfileError, TData>(
    ['profile', handle],
    ({ signal }) => getProfile({ handle }, signal),
    {
      enabled: enabled && typeof handle !== 'undefined',
      ...options,
    }
  )

export const prefetchProfile = (
  client: QueryClient,
  { handle }: ProfileVariables
) => {
  return client.prefetchQuery(['profile', handle], ({ signal }) =>
    getProfile({ handle }, signal)
  )
}

export const useProfilePrefetch = () => {
  const client = useQueryClient()

  return useCallback(
    ({ handle }: ProfileVariables) => {
      if (handle) {
        return prefetchProfile(client, { handle })
      }

      return Promise.resolve()
    },
    [client]
  )
}
