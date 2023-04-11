import { LockClosedIcon } from '@heroicons/react/24/solid'
import { isAuthApiError } from '@supabase/supabase-js'
import Head from 'next/head'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import Form, { FORM_ERROR } from '~/components/forms/Form'
import FormButton from '~/components/forms/FormButton'
import FormInput from '~/components/forms/FormInput'
import Layout from '~/components/layouts/Layout'
import H1 from '~/components/ui/typography/H1'
import { useSignUpMutation } from '~/data/auth/sign-up-mutation'
import { NextPageWithLayout } from '~/lib/types'
import { SignUpSchema } from '~/lib/validations'

const SignUpPage: NextPageWithLayout = () => {
  const router = useRouter()
  const { mutateAsync: signUp } = useSignUpMutation({
    onSuccess() {
      toast.success(
        'You have signed up successfully! Please check your email to confirm your account.'
      )
      router.push('/sign-in')
    },
  })

  return (
    <div className="flex items-center justify-center min-h-full px-4 py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Sign Up | dbdev</title>
      </Head>

      <div className="w-full max-w-md space-y-8">
        <H1>Sign Up</H1>

        <Form
          initialValues={{
            displayName: '',
            handle: '',
            email: '',
            password: '',
          }}
          onSubmit={async ({ email, password, handle, displayName }) => {
            try {
              await signUp({ email, password, handle, displayName })
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
          schema={SignUpSchema}
        >
          <FormInput
            name="displayName"
            label="Display Name"
            type="text"
            autoComplete="name"
          />

          <FormInput
            name="handle"
            label="Handle"
            type="text"
            autoComplete="username"
          />

          <FormInput
            name="email"
            label="Email address"
            type="email"
            autoComplete="email"
          />

          <FormInput
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
          />

          <FormButton>Sign Up</FormButton>
        </Form>
      </div>
    </div>
  )
}

SignUpPage.getLayout = (page) => <Layout>{page}</Layout>

export default SignUpPage
