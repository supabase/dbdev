import { PostgrestError } from "@supabase/supabase-js"
import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query"
import supabase from "~/lib/supabase"

type NewAccessTokenVariables = {
    tokenName: string
}

export async function newAccessToken({
  tokenName,
}: NewAccessTokenVariables) {
  const { data, error } = await supabase.rpc('new_access_token', {
    token_name: tokenName,
  })

  if (error) throw error
  return data
}

type NewAccessTokenData = Awaited<ReturnType<typeof newAccessToken>>
type NewAccessTokenError = PostgrestError

export const useNewAccessTokenMutation = ({
  onSuccess,
  ...options
}: Omit<
  UseMutationOptions<
    NewAccessTokenData,
    NewAccessTokenError,
    NewAccessTokenVariables
  >,
  'mutationFn'
> = {}) => {
  const queryClient = useQueryClient()

  return useMutation<
    NewAccessTokenData,
    NewAccessTokenError,
    NewAccessTokenVariables
  >(
    ({ tokenName }) =>
      newAccessToken({ tokenName }),
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
