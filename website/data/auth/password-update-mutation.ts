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

export const useUpdatePasswordMutation = (
  options: Omit<
    UseMutationOptions<
      UpdatePasswordData,
      UpdatePasswordError,
      UpdatePasswordVariables
    >,
    'mutationFn'
  > = {}
) => {
  const { onSuccess, ...restOptions } = options
  const queryClient = useQueryClient()

  return useMutation<
    UpdatePasswordData,
    UpdatePasswordError,
    UpdatePasswordVariables
  >({
    mutationFn: ({ newPassword }) => updatePassword({ newPassword }),
    async onSuccess(data, variables, context) {
      await queryClient.resetQueries()
      if (onSuccess) {
        ;(onSuccess as any)(data, variables, context)
      }
    },
    ...restOptions,
  })
}
