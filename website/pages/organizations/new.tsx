import Head from 'next/head'
import { useRouter } from 'next/router'
import Form, { FORM_ERROR } from '~/components/forms/Form'
import FormButton from '~/components/forms/FormButton'
import FormInput from '~/components/forms/FormInput'
import AuthenticatedLayout from '~/components/layouts/AuthenticatedLayout'
import H1 from '~/components/ui/typography/H1'
import { useOrganizationCreateMutation } from '~/data/organizations/organization-create-mutation'
import { useProfilePrefetch } from '~/data/profiles/profile-query'
import { useUser } from '~/lib/auth'
import { NextPageWithLayout } from '~/lib/types'
import { NewOrgSchema } from '~/lib/validations'

const NewOrganizationPage: NextPageWithLayout = () => {
  const router = useRouter()
  const user = useUser()

  const prefetchProfile = useProfilePrefetch()

  const { mutateAsync: createOrg } = useOrganizationCreateMutation({
    async onSuccess({ handle }) {
      await prefetchProfile({ handle })

      router.push(`/${handle}`)
    },
  })

  return (
    <div className="flex flex-col gap-8">
      <Head>
        <title>New Organization | dbdev</title>
      </Head>

      <H1>New Organization</H1>

      <Form
        initialValues={{ handle: '', displayName: '' }}
        onSubmit={async ({ handle, displayName }) => {
          if (!user?.email) {
            return {
              [FORM_ERROR]: 'You must be signed in to create an organization',
            }
          }

          try {
            await createOrg({
              handle,
              displayName,
              contactEmail: user.email,
              userId: user.id,
            })
          } catch (error: any) {
            return {
              [FORM_ERROR]:
                'Sorry, we had an unexpected error. Please try again. - ' +
                error.toString(),
            }
          }
        }}
        schema={NewOrgSchema}
      >
        <FormInput
          name="displayName"
          label="Display Name"
          placeholder="Supabase"
        />

        <FormInput name="handle" label="Handle" placeholder="supabase" />

        <FormButton className="self-end">Create</FormButton>
      </Form>
    </div>
  )
}

NewOrganizationPage.getLayout = (page) => (
  <AuthenticatedLayout>{page}</AuthenticatedLayout>
)

export default NewOrganizationPage
