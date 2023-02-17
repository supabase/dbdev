import AuthenticatedLayout from '~/components/layouts/AuthenticatedLayout'
import { NextPageWithLayout } from '~/lib/types'
import supabase from '~/lib/supabase'
import { useParams } from '~/lib/utils'
import { useAuth } from '~/lib/auth'

const EditAccountPage: NextPageWithLayout = () => {
  const { handle } = useParams()

  const { refreshSession } = useAuth()

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    const extension = file.name.split('.').pop()
    const nowStr = new Date().getTime().toString()

    const path = `${handle}/avatar-${nowStr}.${extension}`

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(path, file, {
        cacheControl: `${60 * 60 * 24 * 365}`, // 1 year
      })

    if (error) {
      console.log('Error uploading file: ', error.message)
      return
    }

    await refreshSession()
  }

  return (
    <div>
      <h1>Edit Account</h1>

      <h2>Upload Profile</h2>
      <input type="file" onChange={uploadAvatar} />
    </div>
  )
}

EditAccountPage.getLayout = (page) => (
  <AuthenticatedLayout>{page}</AuthenticatedLayout>
)

export default EditAccountPage
