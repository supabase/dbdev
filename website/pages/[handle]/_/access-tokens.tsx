import Form, { FORM_ERROR } from '~/components/forms/Form'
import FormButton from '~/components/forms/FormButton'
import FormInput from '~/components/forms/FormInput'
import Head from 'next/head'
import { MouseEventHandler, useState } from 'react'
import Layout from '~/components/layouts/Layout'
import { useAuth } from '~/lib/auth'
import { NextPageWithLayout } from '~/lib/types'
import { useNewAccessTokenMutation } from '~/data/access-tokens/create-access-token'
import toast from 'react-hot-toast'
import { useParams } from '~/lib/utils'
import { useRouter } from 'next/router'
import H1 from '~/components/ui/typography/H1'
import AccessTokenCard from '~/components/access-tokens/AccessTokenCard'
import {
  AccessTokensResponse,
  useAccessTokensQuery,
} from '~/data/access-tokens/access-tokens-query'
import Button from '~/components/ui/Button'
import { NewTokenSchema } from '~/lib/validations'
import H3 from '~/components/ui/typography/H3'
import CopyButton from '~/components/ui/CopyButton'
import { useDeleteAccessTokenMutation } from '~/data/access-tokens/delete-access-token'

const ApiTokensPage: NextPageWithLayout = () => {
  const router = useRouter()
  const { handle } = useParams()
  const { refreshSession } = useAuth()

  const [showNewTokenForm, setShowNewTokenForm] = useState(false)
  const [newToken, setNewToken] = useState('')

  const { mutateAsync: createNewAccessToken } = useNewAccessTokenMutation({
    onSuccess() {
      toast.success('Successfully created token!')
    },
  })

  const {
    data: accessTokens,
    isLoading: accessTokensLoading,
    isSuccess: isAccessTokensSuccess,
  } = useAccessTokensQuery()

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

  type AccessTokensPageProps = {
    onClickNewToken: MouseEventHandler<HTMLButtonElement>
    isSuccess: boolean
    isLoading: boolean
    accessTokens: AccessTokensResponse | undefined
  }

  const AccessTokensPage = ({
    onClickNewToken,
    isSuccess,
    isLoading,
    accessTokens,
  }: AccessTokensPageProps) => (
    <>
      <H1 className="!text-3xl">Access Tokens</H1>
      <div className="flex flex-row my-6">
        <Button
          className="bg-slate-700 text-white hover:bg-slate-500 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-500"
          onClick={onClickNewToken}
        >
          New Token
        </Button>
      </div>
      {isLoading ? (
        <p>Loading</p>
      ) : isSuccess ? (
        accessTokens &&
        accessTokens.map((accessToken) => (
          <AccessTokenCard
            key={accessToken.id}
            tokenId={accessToken.id}
            tokenName={accessToken.token_name}
            createdAt={accessToken.created_at}
            onRevokeButtonClick={revokeToken}
          ></AccessTokenCard>
        ))
      ) : (
        <p className="text-red-500">Error loading access tokens</p>
      )}
    </>
  )

  type NewTokenPageProps = {
    onCloseButtonClick: MouseEventHandler<HTMLButtonElement>
    newToken: string
  }

  const NewTokenPage = ({
    newToken,
    onCloseButtonClick,
  }: NewTokenPageProps) => (
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
          onClick={onCloseButtonClick}
          variant="subtle"
          className="mt-4 self-end"
        >
          Close
        </Button>
      </div>
    </div>
  )

  type NewTokenFormProps = {
    onCancelButtonClick: MouseEventHandler<HTMLButtonElement>
    onCreateTokenButtonClick: ({ tokenName }: { tokenName: string }) => Promise<
      | {
          'FINAL_FORM/form-error': any
        }
      | undefined
    >
  }

  const NewTokenForm = ({
    onCancelButtonClick,
    onCreateTokenButtonClick,
  }: NewTokenFormProps) => (
    <div className="w-full max-w-lg mx-auto space-y-8">
      <H1 className="!text-3xl">New Token</H1>
      <Form onSubmit={onCreateTokenButtonClick} schema={NewTokenSchema}>
        <FormInput
          name="tokenName"
          label="Token name"
          type="text"
          placeholder="Enter a new token name"
        />
        <div className="flex flex-row justify-end space-x-4">
          <Button
            onClick={onCancelButtonClick}
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
  )

  return (
    <>
      <Head>
        <title>Access Tokens | The Database Package Manager</title>
      </Head>
      <div className="flex flex-col gap-4 pb-16 mt-8">
        {newToken ? (
          <NewTokenPage
            newToken={newToken}
            onCloseButtonClick={() => {
              setNewToken('')
              setShowNewTokenForm(false)
            }}
          ></NewTokenPage>
        ) : showNewTokenForm ? (
          <NewTokenForm
            onCancelButtonClick={() => setShowNewTokenForm(false)}
            onCreateTokenButtonClick={createNewToken}
          ></NewTokenForm>
        ) : (
          <AccessTokensPage
            onClickNewToken={() => setShowNewTokenForm(true)}
            isLoading={accessTokensLoading}
            isSuccess={isAccessTokensSuccess}
            accessTokens={accessTokens}
          ></AccessTokensPage>
        )}
      </div>
    </>
  )
}

ApiTokensPage.getLayout = (page) => <Layout>{page}</Layout>

export default ApiTokensPage
