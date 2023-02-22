import { useRouter } from 'next/router'
import { useState } from 'react'
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

  const [handle, setHandle] = useState('')

  const handleCreate = () => {
    if (!user) return

    mutate({
      handle: handle,
      displayName: handle,
      contactEmail: 'alaister@supabase.io',
      userId: user.id,
    })
  }

  return (
    <div>
      <h1>New Organization</h1>

      <label htmlFor="handle">Handle</label>
      <input
        id="handle"
        type="text"
        value={handle}
        onChange={(e) => setHandle(e.target.value)}
      />

      <button onClick={handleCreate}>Save</button>
    </div>
  )
}

NewOrganizationPage.getLayout = (page) => (
  <AuthenticatedLayout>{page}</AuthenticatedLayout>
)

export default NewOrganizationPage
