import Layout from '~/components/layouts/Layout'
import H1 from '~/components/ui/typography/H1'
import { useAuth, withAuth } from '~/lib/auth'
import supabase from '~/lib/supabase'
import { NextPageWithLayout } from '~/lib/types'
import { useParams } from '~/lib/utils'

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
      <H1>Edit Account</H1>

      <h2>Upload Profile</h2>
      <input type="file" onChange={uploadAvatar} />
    </div>
  )
}

EditAccountPage.getLayout = (page) => <Layout>{page}</Layout>

export default withAuth(EditAccountPage)
