import Head from 'next/head'
import { useRouter } from 'next/router'
import Layout from '~/components/layouts/Layout'
import Markdown from '~/components/ui/Markdown'
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
