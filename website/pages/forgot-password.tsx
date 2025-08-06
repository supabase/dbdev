import { isAuthApiError } from '@supabase/supabase-js'
import Head from 'next/head'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import Form, { FORM_ERROR } from '~/components/forms/Form'
import FormButton from '~/components/forms/FormButton'
import FormInput from '~/components/forms/FormInput'
import Layout from '~/components/layouts/Layout'
import H1 from '~/components/ui/typography/h1'
import { useForgotPasswordMutation } from '~/data/auth/forgot-password-mutation'
import { NextPageWithLayout } from '~/lib/types'
import { ForgotPasswordSchema } from '~/lib/validations'

const ForgotPasswordPage: NextPageWithLayout = () => {
  const router = useRouter()
  const { mutateAsync: forgotPassword } = useForgotPasswordMutation({
    onSuccess() {
      toast.success(
        'Password reset email sent successfully! Please check your inbox.'
      )
      router.push('/sign-in')
    },
  })

  return (
    <div className="flex items-center justify-center flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Forgot Password | The Database Package Manager</title>
      </Head>

      <div className="w-full h-full max-w-lg px-10 py-12 space-y-8 border border-gray-200 rounded-md dark:border-slate-700">
        <H1>Forgot Password</H1>

        <Form
          initialValues={{
            email: '',
          }}
          onSubmit={async ({ email }) => {
            try {
              await forgotPassword({
                email,
                redirectTo: `${location.origin}/reset-password`,
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
          schema={ForgotPasswordSchema}
        >
          <div className="space-y-4">
            <FormInput
              name="email"
              label="Email address"
              type="email"
              autoComplete="email"
            />
          </div>

          <FormButton>Send Reset Email</FormButton>
        </Form>
      </div>
    </div>
  )
}

ForgotPasswordPage.getLayout = (page) => <Layout>{page}</Layout>

export default ForgotPasswordPage
