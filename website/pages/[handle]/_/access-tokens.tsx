import Form, { FORM_ERROR } from '~/components/forms/Form'
import FormButton from '~/components/forms/FormButton'
import FormInput from '~/components/forms/FormInput'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import Layout from '~/components/layouts/Layout'
import { useAuth, useUser } from '~/lib/auth'
import { NextPageWithLayout } from '~/lib/types'
import { useNewAccessTokenMutation } from '~/data/access-tokens/create-access-token'
import toast from 'react-hot-toast'
import { useParams } from '~/lib/utils'
import { useProfileQuery } from '~/data/profiles/profile-query'
import { useUsersOrganizationsQuery } from '~/data/organizations/users-organizations-query'
import { useRouter } from 'next/router'
import H1 from '~/components/ui/typography/H1'
import AccessTokenCard from '~/components/access-tokens/AccessTokenCard'
import { useAccessTokensQuery } from '~/data/access-tokens/access-tokens-query'
import Button from '~/components/ui/Button'
import { NewTokenSchema } from '~/lib/validations'
import H3 from '~/components/ui/typography/H3'
import CopyButton from '~/components/ui/CopyButton'
import { useDeleteAccessTokenMutation } from '~/data/access-tokens/delete-access-token'

const ApiTokensPage: NextPageWithLayout = () => {
  const user = useUser()
  const router = useRouter()
  const { handle } = useParams()
  const { refreshSession } = useAuth()
  const {
    data: profile,
    isLoading,
    isSuccess: isProfileSuccess,
  } = useProfileQuery({ handle })
  const { data: organizations, isSuccess: isOrgsSuccess } =
    useUsersOrganizationsQuery({ userId: user?.id })

  const isUser = user?.id === profile?.id
  const isMember =
    organizations?.find((org) => org.handle === handle) !== undefined
  const preventUpdating = !isUser && !isMember

  useEffect(() => {
    if (isProfileSuccess && isOrgsSuccess) {
      if (preventUpdating) {
        toast.error('Unable to open api tokens page')
        router.push(`/${handle}`)
      }
    }
  }, [isProfileSuccess, isOrgsSuccess, preventUpdating, handle, router])

  const [showNewTokenForm, setShowNewTokenForm] = useState(false)
  const [newToken, setNewToken] = useState('')

  const { mutateAsync: createNewAccessToken } = useNewAccessTokenMutation({
    onSuccess() {
      toast.success('Successfully created token!')
    },
  })

  const { data: accessTokens, isSuccess: isAccessTokensSuccess } =
    useAccessTokensQuery()

  const createNewToken = async ({ tokenName }: { tokenName: string }) => {
    try {
      await refreshSession()
      const newToken = await createNewAccessToken({ tokenName })
      setNewToken(newToken)
    } catch (error: any) {
      const message =
        error.message ??
        `Sorry, we had an unexpected error. Please try again. - ${error.toString()}`
      return {
        [FORM_ERROR]: message,
      }
    }
  }

  const { mutateAsync: deleteAccessToken } = useDeleteAccessTokenMutation({
    onSuccess() {
      toast.success('Successfully revoked token!')
      router.replace(`/${handle}/_/access-tokens`)
    },
  })

  const revokeToken = async (tokenId: string) => {
    try {
      deleteAccessToken({ tokenId })
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
        <title>Access Tokens | The Database Package Manager</title>
      </Head>
      <div className="flex flex-col gap-4 pb-16 mt-8">
        {newToken ? (
          <div className="w-full max-w-lg mx-auto space-y-8">
            <H1 className="!text-3xl">New Token</H1>
            <H3 className="text-slate-500">
              Make sure you copy the following token now. It will never be shown
              again. Then run the{' '}
              <span className="font-sans font-normal tracking-tight">
                dbdev login
              </span>{' '}
              command in a terminal and paste the copied token.
            </H3>
            <Form onSubmit={() => {}} initialValues={{ token: `${newToken}` }}>
              <div className="flex flex-row w-full">
                <textarea
                  disabled
                  value={`${newToken}`}
                  className="flex h-16 w-full rounded-md border border-slate-300 bg-transparent
                      py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2
                      focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed
                      disabled:opacity-50 dark:border-slate-700 dark:text-slate-50 dark:focus:ring-slate-400
                      dark:focus:ring-offset-slate-900 resize-none"
                ></textarea>
                <CopyButton getValue={() => newToken} />
              </div>
            </Form>
            <div className="flex flex-row-reverse">
              <Button
                onClick={() => {
                  setNewToken('')
                  setShowNewTokenForm(false)
                }}
                variant="subtle"
                className="mt-4 self-end"
              >
                Close
              </Button>
            </div>
          </div>
        ) : showNewTokenForm ? (
          <div className="w-full max-w-lg mx-auto space-y-8">
            <H1 className="!text-3xl">New Token</H1>
            <Form onSubmit={createNewToken} schema={NewTokenSchema}>
              <FormInput
                name="tokenName"
                label="Token name"
                type="text"
                placeholder="Enter a new token name"
              />
              <div className="flex flex-row justify-end space-x-4">
                <Button
                  onClick={() => setShowNewTokenForm(false)}
                  variant="subtle"
                  className="mt-4"
                >
                  Cancel
                </Button>
                <FormButton className="bg-slate-700 text-white hover:bg-slate-500 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-500">
                  Create Token
                </FormButton>
              </div>
            </Form>
          </div>
        ) : (
          <>
            <H1 className="!text-3xl">Access Tokens</H1>
            <div className="flex flex-row my-6">
              <Button
                className="bg-slate-700 text-white hover:bg-slate-500 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-500"
                onClick={() => setShowNewTokenForm(true)}
              >
                New Token
              </Button>
            </div>
            {isAccessTokensSuccess &&
              accessTokens.map((accessToken) => (
                <AccessTokenCard
                  key={accessToken.id}
                  tokenId={accessToken.id}
                  tokenName={accessToken.token_name}
                  created_at={accessToken.created_at}
                  onRevoke={revokeToken}
                ></AccessTokenCard>
              ))}
          </>
        )}
      </div>
    </>
  )
}

ApiTokensPage.getLayout = (page) => <Layout>{page}</Layout>

export default ApiTokensPage
