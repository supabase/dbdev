import dayjs from 'dayjs'
import Button from '../ui/Button'

export interface ApiTokenCardProps {
  tokenId: string
  tokenName: string
  created_at: string
  onRevoke: (tokenId: string) => any
}

const AccessTokenCard = ({
  tokenId,
  tokenName,
  created_at,
  onRevoke,
}: ApiTokenCardProps) => {
  return (
    <div className="rounded-lg px-6 py-5 border border-gray-200 flex justify-between">
      <div className="flex flex-col">
        <div className="font-medium dark:text-white">{tokenName}</div>
        <div className="text-gray-400 text-sm">{`Created ${dayjs(
          created_at
        ).fromNow()}`}</div>
      </div>
      <Button variant="subtle" onClick={() => onRevoke(tokenId)}>
        Revoke
      </Button>
    </div>
  )
}

export default AccessTokenCard
