import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query'
import supabase from '~/lib/supabase'

type UpdateProfileVariables = {
  handle: string
  displayName?: string | null
  bio?: string | null
}

export async function updateProfile({
  handle,
  displayName,
  bio,
}: UpdateProfileVariables) {
  const { data, error } = await supabase.rpc('update_profile', {
    handle,
    display_name: displayName ?? undefined,
    bio: bio ?? undefined,
  })

  if (error) throw error
  return data
}

type UpdateProfileData = Awaited<ReturnType<typeof updateProfile>>
type UpdateProfileError = any

export const useUpdateProfileMutation = (
  options: Omit<
    UseMutationOptions<
      UpdateProfileData,
      UpdateProfileError,
      UpdateProfileVariables
    >,
    'mutationFn'
  > = {}
) => {
  const { onSuccess, ...restOptions } = options
  const queryClient = useQueryClient()

  return useMutation<
    UpdateProfileData,
    UpdateProfileError,
    UpdateProfileVariables
  >({
    mutationFn: ({ handle, displayName, bio }) =>
      updateProfile({ handle, displayName, bio }),
    async onSuccess(data, variables, context) {
      await queryClient.resetQueries()
      if (onSuccess) {
        ;(onSuccess as any)(data, variables, context)
      }
    },
    ...restOptions,
  })
}
