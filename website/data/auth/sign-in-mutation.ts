import { AuthError } from '@supabase/supabase-js'
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query'
import supabase from '~/lib/supabase'

type SignInVariables = { email: string; password: string }

export async function signIn({ email, password }: SignInVariables) {
  const {
    error,
    data: { session },
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return { session }
}

type SignInData = Awaited<ReturnType<typeof signIn>>
type SignInError = AuthError

export const useSignInMutation = (
  options: Omit<
    UseMutationOptions<SignInData, SignInError, SignInVariables>,
    'mutationFn'
  > = {}
) => {
  const { onSuccess, ...restOptions } = options
  const queryClient = useQueryClient()

  return useMutation<SignInData, SignInError, SignInVariables>({
    mutationFn: ({ email, password }) => signIn({ email, password }),
    async onSuccess(data, variables, context) {
      await queryClient.resetQueries()
      if (onSuccess) {
        ;(onSuccess as any)(data, variables, context)
      }
    },
    ...restOptions,
  })
}
