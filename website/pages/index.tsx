import Head from 'next/head'
import Layout from '~/components/layouts/Layout'
import { NextPageWithLayout } from '~/lib/types'

const IndexPage: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Home | The Database Package Manager</title>
      </Head>

      <div className="flex items-center justify-center flex-1">
        <h1 className="text-2xl font-extrabold -translate-y-10 sm:text-4xl md:text-7xl lg:text-9xl">
          The Database Package Manager
        </h1>
      </div>
    </>
  )
}

IndexPage.getLayout = (page) => <Layout>{page}</Layout>

export default IndexPage
