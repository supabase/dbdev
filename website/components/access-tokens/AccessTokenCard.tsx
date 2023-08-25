import dayjs from 'dayjs'
import Button from '../ui/Button'

export interface ApiTokenCardProps {
  tokenId: string
  tokenName: string
  createdAt: string
  onRevokeButtonClick: (tokenId: string) => any
}

const AccessTokenCard = ({
  tokenId,
  tokenName,
  createdAt,
  onRevokeButtonClick,
}: ApiTokenCardProps) => {
  return (
    <div className="rounded-lg px-6 py-5 border border-gray-200 flex justify-between">
      <div className="flex flex-col">
        <div className="font-medium dark:text-white">{tokenName}</div>
        <div className="text-gray-400 text-sm">{`Created ${dayjs(
          createdAt
        ).fromNow()}`}</div>
      </div>
      <Button variant="subtle" onClick={() => onRevokeButtonClick(tokenId)}>
        Revoke
      </Button>
    </div>
  )
}

export default AccessTokenCard
