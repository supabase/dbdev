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

export type ProfileResponse = {
  id: string
  handle: string
  display_name: string | null
  contact_email: string | null
  avatar_path: string | null
  bio: string | null
  created_at: string
}

export async function getProfile(
  { handle }: ProfileVariables,
  signal?: AbortSignal
) {
  if (!handle) {
    throw new Error('handle is required')
  }

  let accountQuery = supabase.from('accounts').select('*').eq('handle', handle)

  let organizationQuery = supabase
    .from('organizations')
    .select('*')
    .eq('handle', handle)

  if (signal) {
    accountQuery = accountQuery.abortSignal(signal)
    organizationQuery = organizationQuery.abortSignal(signal)
  }

  const [
    { data: account, error: accountError },
    { data: organization, error: organizationError },
  ] = await Promise.all([
    accountQuery.maybeSingle<ProfileResponse>(),
    organizationQuery.maybeSingle<ProfileResponse>(),
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

export const useProfilePrefetch = ({ handle }: ProfileVariables) => {
  const client = useQueryClient()

  return useCallback(() => {
    if (handle) {
      prefetchProfile(client, { handle })
    }
  }, [client, handle])
}
