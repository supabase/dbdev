import Form, { FORM_ERROR } from '~/components/forms/Form'
import FormButton from '~/components/forms/FormButton'
import FormInput from '~/components/forms/FormInput'
import Head from 'next/head'
import { useState } from 'react'
import Layout from '~/components/layouts/Layout'
import { useAuth } from '~/lib/auth'
import { NextPageWithLayout } from '~/lib/types'
import { useNewAccessTokenMutation } from '~/data/profiles/create-access-token'
import toast from 'react-hot-toast'

const ApiTokensPage: NextPageWithLayout = () => {
  const { refreshSession } = useAuth()
  const [showNewTokenForm, setShowNewTokenForm] = useState(false)
  const [newToken, setNewToken] = useState('')

  const { mutateAsync: createNewAccessToken } = useNewAccessTokenMutation({
    onSuccess() {
      toast.success('Successfully created token!')
    },
  })

  const onSubmit = async ({ tokenName }: { tokenName: string }) => {
    try {
      await refreshSession()
      const newToken = await createNewAccessToken({ tokenName })
      setNewToken(newToken)
    } catch (error: any) {
      return {
        [FORM_ERROR]:
          'Sorry, we had an unexpected error. Please try again. - ' +
          error.toString(),
      }
    }
  }

  return (
    <>
      <Head>
        <title>API Tokens | The Database Package Manager</title>
      </Head>
      <div className="flex flex-col gap-8 pb-16 mt-8">
        {newToken ? (
          <>
            <h1>Copy this token now. It will not be shown again.</h1>
            <p>{`${newToken}`}</p>
          </>
        ) : showNewTokenForm ? (
          <>
            <Form onSubmit={onSubmit}>
              <FormInput name="tokenName" label="Token name" type="text" />
              <FormButton>Create Token</FormButton>
              <button
                className="flex items-center px-4 py-2 space-x-2 text-sm text-gray-500 transition bg-white border rounded-md dark:bg-transparent dark:border-slate-500 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:border-slate-400 hover:text-gray-700 hover:border-gray-400"
                onClick={() => setShowNewTokenForm(false)}
              >
                Cancel
              </button>
            </Form>
          </>
        ) : (
          <button
            className="flex items-center px-4 py-2 space-x-2 text-sm text-gray-500 transition bg-white border rounded-md dark:bg-transparent dark:border-slate-500 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:border-slate-400 hover:text-gray-700 hover:border-gray-400"
            onClick={() => setShowNewTokenForm(true)}
          >
            New Token
          </button>
        )}
      </div>
    </>
  )
}

ApiTokensPage.getLayout = (page) => <Layout>{page}</Layout>

export default ApiTokensPage
