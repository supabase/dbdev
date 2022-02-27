import { Button } from '@supabase/ui'
import { AuthUser } from '@supabase/supabase-js'
import { Typography } from '@supabase/ui'
import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { AccountDetail } from 'pages/api/account'
import { useRouter } from 'next/router'

export default function AccountInfo({ user, profile }: { user: AuthUser; profile: AccountDetail }) {
  const router = useRouter()
  return (
    <div className="divide-y">
      <div className="p-4">
        <Typography.Text>Signed in: {user.email}</Typography.Text>
      </div>
      <div className="p-4">
        <Typography.Text>Username: {profile.username}</Typography.Text>
      </div>
      <div className="p-4">
        <Button
          type="secondary"
          size="medium"
          block
          onClick={async () => {
            await supabaseClient.auth.signOut()
            router.push('/')
          }}
        >
          Sign Out
        </Button>
      </div>
    </div>
  )
}
