import { AuthError } from '@supabase/supabase-js'
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query'
import supabase from '~/lib/supabase'

type UpdatePasswordVariables = { newPassword: string }

export async function updatePassword({ newPassword }: UpdatePasswordVariables) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    throw error
  }
}

type UpdatePasswordData = Awaited<ReturnType<typeof updatePassword>>
type UpdatePasswordError = AuthError

export const useUpdatePasswordMutation = ({
  onSuccess,
  ...options
}: Omit<
  UseMutationOptions<
    UpdatePasswordData,
    UpdatePasswordError,
    UpdatePasswordVariables
  >,
  'mutationFn'
> = {}) => {
  const queryClient = useQueryClient()

  return useMutation<
    UpdatePasswordData,
    UpdatePasswordError,
    UpdatePasswordVariables
  >(({ newPassword }) => updatePassword({ newPassword }), {
    async onSuccess(data, variables, context) {
      await Promise.all([
        queryClient.resetQueries(),
        await onSuccess?.(data, variables, context),
      ])
    },
    ...options,
  })
}
