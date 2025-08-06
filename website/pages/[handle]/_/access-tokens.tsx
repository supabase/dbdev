import Head from 'next/head'
import { MouseEventHandler, useState } from 'react'
import toast from 'react-hot-toast'
import AccessTokenCard from '~/components/access-tokens/AccessTokenCard'
import Form, { FORM_ERROR } from '~/components/forms/Form'
import FormButton from '~/components/forms/FormButton'
import FormInput from '~/components/forms/FormInput'
import Layout from '~/components/layouts/Layout'
import { Button } from '~/components/ui/button'
import CopyButton from '~/components/ui/copy-button'
import H1 from '~/components/ui/typography/h1'
import H3 from '~/components/ui/typography/h3'
import { useAccessTokensQuery } from '~/data/access-tokens/access-tokens-query'
import { useNewAccessTokenMutation } from '~/data/access-tokens/create-access-token'
import { NextPageWithLayout } from '~/lib/types'
import { NewTokenSchema } from '~/lib/validations'

const ApiTokensPage: NextPageWithLayout = () => {
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

  const createNewToken = async ({ tokenName }: { tokenName: string }) => {
    try {
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

  type AccessTokensPageProps = {
    onClickNewToken: MouseEventHandler<HTMLButtonElement>
  }

  const AccessTokensPage = ({ onClickNewToken }: AccessTokensPageProps) => {
    const {
      data: accessTokens,
      isLoading: accessTokensLoading,
      isSuccess: isAccessTokensSuccess,
      isError: isAccessTokensError,
    } = useAccessTokensQuery()

    return (
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
        {accessTokensLoading && <p className="dark:text-white">Loading...</p>}
        {isAccessTokensSuccess &&
          accessTokens.length > 0 &&
          accessTokens.map((accessToken) => (
            <AccessTokenCard
              key={accessToken.id}
              tokenId={accessToken.id}
              tokenName={accessToken.token_name}
              maskedToken={accessToken.masked_token}
              createdAt={accessToken.created_at}
            />
          ))}
        {isAccessTokensSuccess && accessTokens.length <= 0 && (
          <p className="dark:text-white">
            No access tokens found. Click &quot;New Token&quot; to create one.
          </p>
        )}
        {isAccessTokensError && (
          <p className="text-red-500">Error loading access tokens</p>
        )}
      </>
    )
  }

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
          />
          <CopyButton
            className="w-14 rounded-none rounded-r-md"
            getValue={() => newToken}
          />
        </div>
      </Form>
      <div className="flex flex-row-reverse">
        <Button onClick={onCloseButtonClick} variant="secondary">
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
            variant="secondary"
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
          />
        )}
        {!newToken && showNewTokenForm && (
          <NewTokenForm
            onCancelButtonClick={() => setShowNewTokenForm(false)}
            onCreateTokenButtonClick={createNewToken}
            disabled={creatingNewAccessToken}
          />
        )}
        {!newToken && !showNewTokenForm && (
          <AccessTokensPage onClickNewToken={() => setShowNewTokenForm(true)} />
        )}
      </div>
    </>
  )
}

ApiTokensPage.getLayout = (page) => <Layout>{page}</Layout>

export default ApiTokensPage
