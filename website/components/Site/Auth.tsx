import { signUp, signIn } from '../../lib/supabaseClient'
import { Typography, Button, Tabs } from '@supabase/ui'
import { useState } from 'react'
import { Input } from '@supabase/ui'

export default function Auth() {
  const [tabState, setTabState] = useState('signin')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  return (
    <div className=" w-3/4 my-12 m-auto">
      <Tabs size="large" block>
        <Tabs.Panel id="signin" label="Sign in">
          <>
            <div>
              <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <Button onClick={() => signIn(email, password)}>Sign in</Button>
            </div>
          </>
        </Tabs.Panel>
        <Tabs.Panel id="signup" label="Sign up">
          <>
            <div>
              <Input
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <Input
                label="Password (again)"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div>
              <Button onClick={() => signUp(username, email, password)}>Sign up</Button>
            </div>
          </>
        </Tabs.Panel>
      </Tabs>
    </div>
  )
}
