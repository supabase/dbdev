import { PostgrestError } from '@supabase/supabase-js'
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query'
import supabase from '~/lib/supabase'
import { accessTokensQueryKey } from './access-tokens-query'

type DeleteAccessTokenVariables = {
  tokenId: string
}

export async function deleteAccessToken({
  tokenId,
}: DeleteAccessTokenVariables) {
  const { data, error } = await supabase.rpc('delete_access_token', {
    token_id: tokenId,
  })

  if (error) throw error
  return data
}

type DeleteAccessTokenData = Awaited<ReturnType<typeof deleteAccessToken>>
type DeleteAccessTokenError = PostgrestError

export const useDeleteAccessTokenMutation = (
  options: Omit<
    UseMutationOptions<
      DeleteAccessTokenData,
      DeleteAccessTokenError,
      DeleteAccessTokenVariables,
      unknown
    >,
    'mutationFn'
  > = {}
) => {
  const queryClient = useQueryClient()
  const { onSuccess, ...restOptions } = options

  return useMutation({
    mutationFn: ({ tokenId }: DeleteAccessTokenVariables) =>
      deleteAccessToken({ tokenId }),
    ...restOptions,
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: [accessTokensQueryKey] })
      if (onSuccess) {
        ;(onSuccess as any)(data, variables, context)
      }
    },
  })
}
