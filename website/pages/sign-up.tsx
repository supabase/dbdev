import { isAuthApiError } from '@supabase/supabase-js'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import Form, { FORM_ERROR } from '~/components/forms/Form'
import FormButton from '~/components/forms/FormButton'
import FormInput from '~/components/forms/FormInput'
import Layout from '~/components/layouts/Layout'
import H1 from '~/components/ui/typography/h1'
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
    <div className="flex items-center justify-center flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Sign Up | The Database Package Manager</title>
      </Head>

      <div className="w-full max-w-lg px-10 py-12 space-y-8 border border-gray-200 rounded-md dark:border-slate-700">
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
          <div className="space-y-4">
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
              autoComplete="new-password"
            />
          </div>

          <FormButton variant="default">Sign Up</FormButton>

          <p className="text-center text-sm mt-2 text-lighter text-slate-500 ">
            Already have an account?{' '}
            <Link
              href="/sign-in"
              className=" transition underline hover:decoration-2"
            >
              Sign In
            </Link>
          </p>
        </Form>
      </div>
    </div>
  )
}

SignUpPage.getLayout = (page) => <Layout>{page}</Layout>

export default SignUpPage
