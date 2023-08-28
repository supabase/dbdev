import dayjs from 'dayjs'
import Button from '../ui/Button'

export interface ApiTokenCardProps {
  tokenId: string
  tokenName: string
  maskedToken: string
  createdAt: string
  onRevokeButtonClick: (tokenId: string) => any
}

const AccessTokenCard = ({
  tokenId,
  tokenName,
  maskedToken,
  createdAt,
  onRevokeButtonClick,
}: ApiTokenCardProps) => {
  return (
    <div className="rounded-lg px-6 py-5 border border-gray-200 flex justify-between">
      <div className="flex flex-col space-y-4">
        <div className="font-medium text-lg dark:text-white">{tokenName}</div>
        <div className="text-gray-500" >{`Token: ${maskedToken}`}</div>
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
