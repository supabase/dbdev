import Layout from '~/components/layouts/Layout'
import { NextPageWithLayout } from '~/lib/types'

const FaqPage: NextPageWithLayout = () => {
  return null
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/docs/faq',
      permanent: false,
    },
  }
}

FaqPage.getLayout = (page) => <Layout>{page}</Layout>

export default FaqPage
