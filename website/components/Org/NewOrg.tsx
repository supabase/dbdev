import { AuthUser } from '@supabase/supabase-js'
import { Button, Input, Form } from '@supabase/ui'
import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { object, string, ref } from 'yup'

const NewOrgSchema = object().shape({
  username: string()
    .min(4, 'Must be more than 4 characters.')
    .max(20, 'Too Long!')
    .required('Required'),
  display_name: string()
    .min(4, 'Must be more than 4 characters.')
    .max(50, 'Too Long!')
    .required('Required'),
  bio: string().max(500, 'Too Long!'),
})

export default function NewOrg({ user }: { user: AuthUser }) {
  async function onCreate(username: string, display_name: string, bio: string) {
    const { data, error } = await supabaseClient.rpc('create_organization', {
      username,
      display_name,
      bio,
      contact_email: user.email,
    })
    if (error) {
      alert(error.message)
      return { error }
    } else {
      console.log('data', data)
      return { data }
    }
  }

  return (
    <Form
      initialValues={{
        username: '',
        display_name: '',
        bio: '',
      }}
      validationSchema={NewOrgSchema}
      onSubmit={async ({ username, display_name, bio }, { setSubmitting }: any) => {
        const { data, error } = await onCreate(username, display_name, bio)
        setSubmitting(false)
      }}
    >
      {({ isSubmitting }: { isSubmitting: boolean }) => (
        <div className="divide-y space-y-4">
          <div className="p-4">
            <Input id="username" label="Org handle" />
          </div>
          <div className="p-4">
            <Input id="display_name" label="Display Name" />
          </div>
          <div className="p-4">
            <Input.TextArea id="bio" label="Bio" type="text" />
          </div>
          <div className="p-4">
            <Button loading={isSubmitting} type="secondary" htmlType="submit" size="medium">
              Create
            </Button>
          </div>
        </div>
      )}
    </Form>
  )
}
