import Layout from '~/components/layouts/Layout'
import { NextPageWithLayout } from '~/lib/types'

const InstallerPage: NextPageWithLayout = () => {
  return null
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/supabase/dbdev',
      permanent: true,
    },
  }
}

InstallerPage.getLayout = (page) => <Layout>{page}</Layout>

export default InstallerPage
