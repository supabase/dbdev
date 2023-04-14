import { AuthError } from '@supabase/supabase-js'
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query'
import supabase from '~/lib/supabase'

type ForgotPasswordVariables = { email: string; redirectTo?: string }

export async function forgotPassword({
  email,
  redirectTo,
}: ForgotPasswordVariables) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  })

  if (error) {
    throw error
  }
}

type ForgotPasswordData = Awaited<ReturnType<typeof forgotPassword>>
type ForgotPasswordError = AuthError

export const useForgotPasswordMutation = ({
  onSuccess,
  ...options
}: Omit<
  UseMutationOptions<
    ForgotPasswordData,
    ForgotPasswordError,
    ForgotPasswordVariables
  >,
  'mutationFn'
> = {}) => {
  const queryClient = useQueryClient()

  return useMutation<
    ForgotPasswordData,
    ForgotPasswordError,
    ForgotPasswordVariables
  >(({ email, redirectTo }) => forgotPassword({ email, redirectTo }), {
    async onSuccess(data, variables, context) {
      await Promise.all([
        queryClient.resetQueries(),
        await onSuccess?.(data, variables, context),
      ])
    },
    ...options,
  })
}
