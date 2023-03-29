import { AuthError } from '@supabase/supabase-js'
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query'
import supabase from '~/lib/supabase'

type SignUpVariables = {
  email: string
  password: string
  handle: string
  displayName?: string | null
  bio?: string | null
}

export async function signUp({
  email,
  password,
  handle,
  displayName,
  bio,
}: SignUpVariables) {
  const {
    error,
    data: { session },
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        handle,
        display_name: displayName,
        bio,
        contact_email: email,
      },
    },
  })

  if (error) {
    throw error
  }

  return { session }
}

type SignUpData = Awaited<ReturnType<typeof signUp>>
type SignUpError = AuthError

export const useSignUpMutation = ({
  onSuccess,
  ...options
}: Omit<
  UseMutationOptions<SignUpData, SignUpError, SignUpVariables>,
  'mutationFn'
> = {}) => {
  const queryClient = useQueryClient()

  return useMutation<SignUpData, SignUpError, SignUpVariables>(
    ({ email, password, handle, displayName, bio }) =>
      signUp({ email, password, handle, displayName, bio }),
    {
      async onSuccess(data, variables, context) {
        await Promise.all([
          queryClient.resetQueries(),
          await onSuccess?.(data, variables, context),
        ])
      },
      ...options,
    }
  )
}
