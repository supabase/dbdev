import dayjs from 'dayjs'
import { toast } from '~/hooks/use-toast'
import { useDeleteAccessTokenMutation } from '~/data/access-tokens/delete-access-token'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'

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
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-lg">{tokenName}</CardTitle>
          <CardDescription>Token: {maskedToken}</CardDescription>
        </div>
        <Button
          variant="secondary"
          onClick={() => deleteAccessToken({ tokenId })}
          disabled={isDeletingAccessToken}
        >
          Revoke
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Created {dayjs(createdAt).fromNow()}
        </p>
      </CardContent>
    </Card>
  )
}

export default AccessTokenCard
