import { Button } from '@supabase/ui'
import { AuthUser } from '@supabase/supabase-js'
import { Typography } from '@supabase/ui'
import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { AccountDetail } from 'pages/api/account'

export default function AccountInfo({ user, profile }: { user: AuthUser; profile: AccountDetail }) {
  return (
    <div className="divide-y">
      <div className="p-4">
        <Typography.Text>Signed in: {user.email}</Typography.Text>
      </div>
      <div className="p-4">
        <Typography.Text>Username: {profile.username}</Typography.Text>
      </div>
      <div className="p-4">
        <Button className="w-full" onClick={() => supabaseClient.auth.signOut()}>
          Sign Out
        </Button>
      </div>
    </div>
  )
}
