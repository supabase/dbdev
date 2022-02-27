import { AuthUser } from '@supabase/supabase-js'
import { AccountDetail } from 'pages/api/account'

export default function Orgs({ user, profile }: { user: AuthUser; profile: AccountDetail }) {
  return (
    <div className="divide-y">
      {profile.organizations.length == 0 ? (
        <div className="p-4">No orgs yet.</div>
      ) : (
        <div>New org</div>
      )}
    </div>
  )
}
