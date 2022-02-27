import { AuthUser } from '@supabase/supabase-js'
import { Button, Input, Typography } from '@supabase/ui'
import { supabase } from 'lib/supabaseClient'
import { useState } from 'react'

export default function NewOrg({ user }: { user: AuthUser }) {
  const [username, setUsername] = useState('')
  const [display_name, setDisplayName] = useState('')
  const [bio, setBio] = useState('')

  async function onCreate() {
    const { data, error } = await supabase.rpc('create_organization', {
      username,
      display_name,
      bio,
      contact_email: user.email,
    })
    if (error) {
      alert(error.message)
    } else {
      console.log('data', data)
    }
  }

  return (
    <div className="divide-y">
      <div className="p-4">
        <Input
          label="Org Identifier"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          descriptionText="letters-and-hyphens only. Must be unique across all of dbdev."
        />
      </div>
      <div className="p-4">
        <Input
          label="Org name"
          value={display_name}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>
      <div className="p-4">
        <Input.TextArea label="Org Info" value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>
      <div className="p-4">
        <Button className="w-full" onClick={() => onCreate()}>
          Create
        </Button>
      </div>
    </div>
  )
}
