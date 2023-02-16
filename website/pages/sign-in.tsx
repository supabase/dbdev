import { LockClosedIcon } from '@heroicons/react/24/solid'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FormEvent, useCallback } from 'react'
import toast from 'react-hot-toast'
import UnauthenticatedLayout from '~/components/layouts/UnauthenticatedLayout'
import { useSignInMutation } from '~/data/auth/sign-in-mutation'
import { NextPageWithLayout } from '~/lib/types'

const SignInPage: NextPageWithLayout = () => {
  const router = useRouter()
  const { mutate: signIn } = useSignInMutation()

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      const { email, password } = Object.fromEntries(
        new FormData(e.currentTarget)
      )

      signIn(
        { email: email.toString(), password: password.toString() },
        {
          onSuccess() {
            toast.success('You have signed in successfully!')
            router.replace('/')
          },
          onError(error) {
            toast.error(error.message)
          },
        }
      )
    },
    [router, signIn]
  )

  return (
    <>
      <Head>
        <title>Sign In | dbdev</title>
      </Head>

      <div className="flex items-center justify-center min-h-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 mb-24 text-3xl font-extrabold text-center text-gray-900">
              Sign in to your account
            </h2>
          </div>

          <form className="mt-8 space-y-6" onSubmit={onSubmit}>
            <div className="-space-y-px rounded-md shadow-sm">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-t-md focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-b-md focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <Link
                  href="/forgot-password"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <LockClosedIcon
                    className="w-5 h-5 text-indigo-500 group-hover:text-indigo-400"
                    aria-hidden="true"
                  />
                </span>
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

SignInPage.getLayout = (page) => (
  <UnauthenticatedLayout>{page}</UnauthenticatedLayout>
)

export default SignInPage
