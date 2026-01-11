import dayjs from 'dayjs'
import { toast } from 'react-hot-toast'
import { useDeleteAccessTokenMutation } from '~/data/access-tokens/delete-access-token'
import { Button } from '~/components/ui/button'

export interface ApiTokenCardProps {
  tokenId: string
  tokenName: string
  maskedToken: string
  createdAt: string
}

const AccessTokenCard = ({
  tokenId,
  tokenName,
  maskedToken,
  createdAt,
}: ApiTokenCardProps) => {
  const { mutate: deleteAccessToken, isPending: isDeletingAccessToken } =
    useDeleteAccessTokenMutation({
      onSuccess() {
        toast.success('Successfully revoked token!')
      },
    })

  return (
    <div className="rounded-lg px-6 py-5 border border-gray-200 flex justify-between">
      <div className="flex flex-col space-y-4">
        <div className="font-medium text-lg dark:text-white">{tokenName}</div>
        <div className="text-gray-500">{`Token: ${maskedToken}`}</div>
        <div className="text-gray-400 text-sm">{`Created ${dayjs(
          createdAt
        ).fromNow()}`}</div>
      </div>
      <Button
        variant="secondary"
        onClick={() => deleteAccessToken({ tokenId })}
        disabled={isDeletingAccessToken}
      >
        Revoke
      </Button>
    </div>
  )
}

export default AccessTokenCard
