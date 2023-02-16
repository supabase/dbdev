import { AuthError } from '@supabase/supabase-js'
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query'
import supabase from '~/lib/supabase'

export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

type SignOutData = Awaited<ReturnType<typeof signOut>>
type SignOutError = AuthError

export const useSignOutMutation = ({
  onSuccess,
  ...options
}: Omit<
  UseMutationOptions<SignOutData, SignOutError, void>,
  'mutationFn'
> = {}) => {
  const queryClient = useQueryClient()

  return useMutation<SignOutData, SignOutError, void>(() => signOut(), {
    async onSuccess(data, variables, context) {
      await Promise.all([
        queryClient.resetQueries(),
        await onSuccess?.(data, variables, context),
      ])
    },
    ...options,
  })
}
