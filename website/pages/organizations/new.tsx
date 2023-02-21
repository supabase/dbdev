import { useRouter } from 'next/router'
import AuthenticatedLayout from '~/components/layouts/AuthenticatedLayout'
import { useOrganizationCreateMutation } from '~/data/organizations/organization-create-mutation'
import { useProfilePrefetch } from '~/data/profiles/profile-query'
import { useUser } from '~/lib/auth'
import { NextPageWithLayout } from '~/lib/types'

const NewOrganizationPage: NextPageWithLayout = () => {
  const router = useRouter()
  const user = useUser()

  const prefetchProfile = useProfilePrefetch()

  const { mutate } = useOrganizationCreateMutation({
    async onSuccess({ handle }) {
      await prefetchProfile({ handle })

      router.push(
        {
          pathname: '/profiles/[handle]',
          query: { handle },
        },
        `/@${handle}`
      )
    },
  })

  const handleCreate = () => {
    if (!user) return

    mutate({
      handle: 'myorg3',
      displayName: 'My Org',
      contactEmail: 'alaisterody@gmail.com',
      userId: user.id,
    })
  }

  return (
    <div>
      <h1>New Organization</h1>

      <button onClick={handleCreate}>Save</button>
    </div>
  )
}

NewOrganizationPage.getLayout = (page) => (
  <AuthenticatedLayout>{page}</AuthenticatedLayout>
)

export default NewOrganizationPage
