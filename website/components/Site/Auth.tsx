import { signUp, signIn } from '../../lib/supabaseClient'
import { Form, Button, Tabs } from '@supabase/ui'
import { useState } from 'react'
import { Input } from '@supabase/ui'
import { object, string, ref } from 'yup'

const SignInSchema = object().shape({
  email: string().email('Invalid email.').required('Required'),
  password: string()
    .min(8, 'Must be more than 8 characters.')
    .max(50, 'Too Long!')
    .required('Required'),
})

const SignUpSchema = object().shape({
  su_username: string()
    .min(4, 'Must be more than 4 characters.')
    .max(20, 'Too Long!')
    .required('Required'),
  su_email: string().email('Invalid email.').required('Required'),
  su_password: string()
    .min(8, 'Must be more than 8 characters.')
    .max(50, 'Too Long!')
    .required('Required'),
  su_password_confirm: string()
    .required('Required')
    .oneOf([ref('su_password')], 'Passwords does not match'),
})

export default function Auth() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  return (
    <div className="w-3/4 my-12 m-auto">
      <Tabs size="large" block>
        <Tabs.Panel id="signin" label="Sign in">
          <Form
            initialValues={{
              email: '',
              password: '',
            }}
            validationSchema={SignInSchema}
            onSubmit={async ({ email, password }, { setSubmitting }: any) => {
              await signIn(email, password)
              setSubmitting(false)
            }}
          >
            {({ isSubmitting }: { isSubmitting: boolean }) => (
              <div className="space-y-4">
                <Input id="email" label="Email" placeholder="your@email.com" />
                <Input id="password" label="Password" type="password" />
                <Button loading={isSubmitting} type="secondary" htmlType="submit" size="medium">
                  Sign In
                </Button>
              </div>
            )}
          </Form>
        </Tabs.Panel>
        <Tabs.Panel id="signup" label="Sign up">
          <Form
            initialValues={{
              email: '',
              password: '',
            }}
            validationSchema={SignUpSchema}
            onSubmit={async ({ su_username, su_email, su_password }, { setSubmitting }: any) => {
              await signUp(su_username, su_email, su_password)
              setSubmitting(false)
            }}
          >
            {({ isSubmitting }: { isSubmitting: boolean }) => (
              <div className="space-y-4">
                <Input
                  id="su_username"
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <Input
                  id="su_email"
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  label="Password"
                  type="password"
                  id="su_password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Input
                  label="Password (again)"
                  type="password"
                  id="su_password_confirm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button loading={isSubmitting} type="secondary" htmlType="submit" size="medium">
                  Sign up
                </Button>
              </div>
            )}
          </Form>
        </Tabs.Panel>
      </Tabs>
    </div>
  )
}
