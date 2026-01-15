import { isAuthApiError } from '@supabase/supabase-js'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { toast } from '~/hooks/use-toast'
import Form, { FORM_ERROR } from '~/components/forms/Form'
import FormButton from '~/components/forms/FormButton'
import FormInput from '~/components/forms/FormInput'
import Layout from '~/components/layouts/Layout'
import H1 from '~/components/ui/typography/h1'
import { useUpdatePasswordMutation } from '~/data/auth/password-update-mutation'
import { NextPageWithLayout } from '~/lib/types'
import { ResetPasswordSchema } from '~/lib/validations'

const ResetPasswordPage: NextPageWithLayout = () => {
  const router = useRouter()
  const { mutateAsync: updatePassword } = useUpdatePasswordMutation({
    onSuccess() {
      toast.success('Password updated successfully!')
      router.push('/')
    },
  })

  return (
    <div className="flex items-center justify-center flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Reset Password | The Database Package Manager</title>
      </Head>

      <div className="w-full h-full max-w-lg px-10 py-12 space-y-8 border border-gray-200 rounded-md dark:border-slate-700">
        <H1>Reset Password</H1>

        <Form
          initialValues={{
            password: '',
            passwordConfirmation: '',
          }}
          onSubmit={async ({ password }) => {
            try {
              await updatePassword({
                newPassword: password,
              })
            } catch (error: any) {
              if (isAuthApiError(error)) {
                return {
                  [FORM_ERROR]: error.message,
                }
              }

              return {
                [FORM_ERROR]:
                  'Sorry, we had an unexpected error. Please try again. - ' +
                  error.toString(),
              }
            }
          }}
          schema={ResetPasswordSchema}
        >
          <div className="space-y-4">
            <FormInput
              name="password"
              label="Password"
              type="password"
              autoComplete="new-password"
            />

            <FormInput
              name="passwordConfirmation"
              label="Password Confirmation"
              type="password"
              autoComplete="new-password"
            />
          </div>

          <FormButton>Save Password</FormButton>
        </Form>
      </div>
    </div>
  )
}

ResetPasswordPage.getLayout = (page) => <Layout>{page}</Layout>

export default ResetPasswordPage
