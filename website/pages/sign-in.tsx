import { isAuthApiError } from '@supabase/supabase-js'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { toast } from '~/hooks/use-toast'
import Form, { FORM_ERROR } from '~/components/forms/Form'
import FormButton from '~/components/forms/FormButton'
import FormInput from '~/components/forms/FormInput'
import Layout from '~/components/layouts/Layout'
import H1 from '~/components/ui/typography/h1'
import { useSignInMutation } from '~/data/auth/sign-in-mutation'
import { NextPageWithLayout } from '~/lib/types'
import { SignInSchema } from '~/lib/validations'

const SignInPage: NextPageWithLayout = () => {
  const router = useRouter()
  const { mutateAsync: signIn } = useSignInMutation({
    onSuccess() {
      toast.success('You have signed in successfully!')
      router.replace('/')
    },
  })

  return (
    <div className="flex items-center justify-center flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Sign In | The Database Package Manager</title>
      </Head>

      <div className="w-full h-full max-w-lg px-10 py-12 space-y-8 border border-gray-200 rounded-md dark:border-slate-700">
        <H1>Sign In</H1>

        <Form
          initialValues={{
            email: '',
            password: '',
          }}
          onSubmit={async ({ email, password }) => {
            try {
              await signIn({ email, password })
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
          schema={SignInSchema}
        >
          <div className="space-y-4">
            <FormInput
              name="email"
              label="Email address"
              type="email"
              autoComplete="email"
            />

            <div>
              <FormInput
                name="password"
                label="Password"
                type="password"
                autoComplete="current-password"
              />
              <div className="flex items-center justify-end mt-2 text-sm">
                <Link
                  href="/forgot-password"
                  className="font-medium underline hover:decoration-2 transition"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>
          </div>

          <FormButton>Sign In</FormButton>
          <p className="text-center text-sm mt-2 text-lighter text-slate-500">
            Need to create an account?{' '}
            <Link
              href="/sign-up"
              className=" transition underline hover:decoration-2"
            >
              Sign Up
            </Link>
          </p>
        </Form>
      </div>
    </div>
  )
}

SignInPage.getLayout = (page) => <Layout>{page}</Layout>

export default SignInPage
