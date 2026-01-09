import { PostgrestError } from '@supabase/supabase-js'
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query'
import supabase from '~/lib/supabase'
import { accessTokensQueryKey } from './access-tokens-query'

type NewAccessTokenVariables = {
  tokenName: string
}

export async function newAccessToken({ tokenName }: NewAccessTokenVariables) {
  const { data, error } = await supabase.rpc('new_access_token', {
    token_name: tokenName,
  })

  if (error) throw error
  return data
}

type NewAccessTokenData = Awaited<ReturnType<typeof newAccessToken>>
type NewAccessTokenError = PostgrestError

export const useNewAccessTokenMutation = (
  options: Omit<
    UseMutationOptions<
      NewAccessTokenData,
      NewAccessTokenError,
      NewAccessTokenVariables,
      unknown
    >,
    'mutationFn'
  > = {}
) => {
  const queryClient = useQueryClient()
  const { onSuccess, ...restOptions } = options

  return useMutation({
    mutationFn: ({ tokenName }: NewAccessTokenVariables) => newAccessToken({ tokenName }),
    ...restOptions,
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: [accessTokensQueryKey] })
      if (onSuccess) {
        ;(onSuccess as any)(data, variables, context)
      }
    },
  })
}
