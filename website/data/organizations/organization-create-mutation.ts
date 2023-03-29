import { AuthError } from '@supabase/supabase-js'
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query'
import supabase from '~/lib/supabase'

type OrganizationCreateVariables = {
  handle: string
  userId: string
  contactEmail: string
  displayName?: string | null
}

export async function createOrganization({
  handle,
  displayName,
  contactEmail,
}: Pick<
  OrganizationCreateVariables,
  'handle' | 'displayName' | 'contactEmail'
>) {
  const { error, data } = await supabase
    .rpc('create_organization', {
      handle,
      contact_email: contactEmail,
      display_name: displayName ?? undefined,
    })
    .select()
    .single<{
      id: string
      created_at: string
      handle: string
      display_name: string
      contact_email: string
      bio: string | null
      avatar_path: string | null
    }>()

  if (error) {
    throw error
  }

  return data
}

type OrganizationCreateData = Awaited<ReturnType<typeof createOrganization>>
type OrganizationCreateError = AuthError

export const useOrganizationCreateMutation = ({
  onSuccess,
  ...options
}: Omit<
  UseMutationOptions<
    OrganizationCreateData,
    OrganizationCreateError,
    OrganizationCreateVariables
  >,
  'mutationFn'
> = {}) => {
  const queryClient = useQueryClient()

  return useMutation<
    OrganizationCreateData,
    OrganizationCreateError,
    OrganizationCreateVariables
  >(
    ({ handle, displayName, contactEmail }) =>
      createOrganization({ handle, displayName, contactEmail }),
    {
      async onSuccess(data, variables, context) {
        await Promise.all([
          queryClient.invalidateQueries([
            'users',
            variables.userId,
            'organizations',
          ]),
          await onSuccess?.(data, variables, context),
        ])
      },
      ...options,
    }
  )
}
