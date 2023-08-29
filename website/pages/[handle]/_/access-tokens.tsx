import Head from 'next/head'
import { useRouter } from 'next/router'
import { MouseEventHandler, useState } from 'react'
import toast from 'react-hot-toast'
import AccessTokenCard from '~/components/access-tokens/AccessTokenCard'
import Form, { FORM_ERROR } from '~/components/forms/Form'
import FormButton from '~/components/forms/FormButton'
import FormInput from '~/components/forms/FormInput'
import Layout from '~/components/layouts/Layout'
import Button from '~/components/ui/Button'
import CopyButton from '~/components/ui/CopyButton'
import H1 from '~/components/ui/typography/H1'
import H3 from '~/components/ui/typography/H3'
import {
  AccessTokensResponse,
  useAccessTokensQuery,
} from '~/data/access-tokens/access-tokens-query'
import { useNewAccessTokenMutation } from '~/data/access-tokens/create-access-token'
import { useDeleteAccessTokenMutation } from '~/data/access-tokens/delete-access-token'
import { useAuth } from '~/lib/auth'
import { NextPageWithLayout } from '~/lib/types'
import { useParams } from '~/lib/utils'
import { NewTokenSchema } from '~/lib/validations'

const ApiTokensPage: NextPageWithLayout = () => {
  const router = useRouter()
  const { handle } = useParams()
  const { refreshSession } = useAuth()

  const [showNewTokenForm, setShowNewTokenForm] = useState(false)
  const [newToken, setNewToken] = useState('')

  const {
    mutateAsync: createNewAccessToken,
    isLoading: creatingNewAccessToken,
  } = useNewAccessTokenMutation({
    onSuccess() {
      toast.success('Successfully created token!')
    },
  })

  const {
    data: accessTokens,
    isLoading: accessTokensLoading,
    isSuccess: isAccessTokensSuccess,
    isError: isAccessTokensError,
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
    isError: boolean
    isLoading: boolean
    accessTokens: AccessTokensResponse | undefined
  }

  const AccessTokensPage = ({
    onClickNewToken,
    isSuccess,
    isError,
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
      {isLoading && <p className="dark:text-white">Loading...</p>}
      {isSuccess &&
        accessTokens &&
        accessTokens.map((accessToken) => (
          <AccessTokenCard
            key={accessToken.id}
            tokenId={accessToken.id}
            tokenName={accessToken.token_name}
            maskedToken={accessToken.masked_token}
            createdAt={accessToken.created_at}
            onRevokeButtonClick={revokeToken}
          ></AccessTokenCard>
        ))}
      {isError && <p className="text-red-500">Error loading access tokens</p>}
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
        <div className="flex flex-row w-full rounded-md border border-slate-300">
          <textarea
            disabled
            value={`${newToken}`}
            className="w-full h-15 mt-1 rounded-md border-none text-sm resize-none bg-transparent text-slate-400"
          ></textarea>
          <CopyButton
            className="w-14 rounded-none rounded-r-md"
            getValue={() => newToken}
          />
        </div>
      </Form>
      <div className="flex flex-row-reverse">
        <Button onClick={onCloseButtonClick} variant="subtle">
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
    disabled: boolean
  }

  const NewTokenForm = ({
    onCancelButtonClick,
    onCreateTokenButtonClick,
    disabled,
  }: NewTokenFormProps) => (
    <div className="w-full max-w-lg mx-auto space-y-8">
      <H1 className="!text-3xl">New Token</H1>
      <Form onSubmit={onCreateTokenButtonClick} schema={NewTokenSchema}>
        <FormInput
          name="tokenName"
          label="Token name"
          type="text"
          placeholder="Enter a new token name"
          disabled={disabled}
        />
        <div className="flex flex-row justify-end space-x-4">
          <Button
            type="button"
            onClick={onCancelButtonClick}
            variant="subtle"
            className="mt-4"
            disabled={disabled}
          >
            Cancel
          </Button>
          <FormButton
            type="submit"
            disabled={disabled}
            className="bg-slate-700 text-white hover:bg-slate-500 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-500"
          >
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
        {newToken && (
          <NewTokenPage
            newToken={newToken}
            onCloseButtonClick={() => {
              setNewToken('')
              setShowNewTokenForm(false)
            }}
          ></NewTokenPage>
        )}
        {!newToken && showNewTokenForm && (
          <NewTokenForm
            onCancelButtonClick={() => setShowNewTokenForm(false)}
            onCreateTokenButtonClick={createNewToken}
            disabled={creatingNewAccessToken}
          ></NewTokenForm>
        )}
        {!newToken && !showNewTokenForm && (
          <AccessTokensPage
            onClickNewToken={() => setShowNewTokenForm(true)}
            isLoading={accessTokensLoading}
            isSuccess={isAccessTokensSuccess}
            isError={isAccessTokensError}
            accessTokens={accessTokens}
          ></AccessTokensPage>
        )}
      </div>
    </>
  )
}

ApiTokensPage.getLayout = (page) => <Layout>{page}</Layout>

export default ApiTokensPage
