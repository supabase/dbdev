import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query'
import supabase from '~/lib/supabase'

type UpdateProfileVariables = { id: string; displayName: string; bio: string }

export async function updateProfile({
  id,
  displayName,
  bio,
}: UpdateProfileVariables) {
  const { data, error } = await supabase
    .from('accounts')
    // @ts-ignore
    .update({ bio, display_name: displayName })
    .eq('id', id)

  if (error) throw error
  return data
}

type UpdateProfileData = Awaited<ReturnType<typeof updateProfile>>
type UpdateProfileError = any

export const useUpdateProfileMutation = ({
  onSuccess,
  ...options
}: Omit<
  UseMutationOptions<
    UpdateProfileData,
    UpdateProfileError,
    UpdateProfileVariables
  >,
  'mutationFn'
> = {}) => {
  const queryClient = useQueryClient()

  return useMutation<
    UpdateProfileData,
    UpdateProfileError,
    UpdateProfileVariables
  >(({ id, displayName, bio }) => updateProfile({ id, displayName, bio }), {
    async onSuccess(data, variables, context) {
      await Promise.all([
        queryClient.resetQueries(),
        await onSuccess?.(data, variables, context),
      ])
    },
    ...options,
  })
}
