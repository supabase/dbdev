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

export const useDeleteAccessTokenMutation = ({
  onSuccess,
  ...options
}: Omit<
  UseMutationOptions<
    DeleteAccessTokenData,
    DeleteAccessTokenError,
    DeleteAccessTokenVariables
  >,
  'mutationFn'
> = {}) => {
  const queryClient = useQueryClient()

  return useMutation<
    DeleteAccessTokenData,
    DeleteAccessTokenError,
    DeleteAccessTokenVariables
  >(({ tokenId }) => deleteAccessToken({ tokenId }), {
    async onSuccess(data, variables, context) {
      await Promise.all([
        queryClient.invalidateQueries([accessTokensQueryKey]),
        onSuccess?.(data, variables, context),
      ])
    },
    ...options,
  })
}
