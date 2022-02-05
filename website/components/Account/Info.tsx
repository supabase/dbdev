import { Checkbox } from '@supabase/ui'
import { Button, Input } from '@supabase/ui'
import { AuthUser } from '@supabase/supabase-js'
import { Typography, Menu } from '@supabase/ui'
import { supabase } from '../../lib/supabaseClient'

export default function AccountInfo({ user }: { user: AuthUser }) {
  return (
    <div className="divide-y">
      <div className="p-4">
        <Typography.Text>Signed in: {user.email}</Typography.Text>
      </div>
      <div className="p-4">
        <Input className="w-full" />
      </div>
      <div className="p-4">
        <Button className="w-full" onClick={() => {}} >Save (TBD)</Button>
      </div>
      <div className="p-4">
        <Button className="w-full" onClick={() => supabase.auth.signOut()} >Sign Out</Button>
      </div>
    </div>
  )
}
