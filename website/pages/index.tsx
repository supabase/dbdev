import Head from 'next/head'
import DynamicLayout from '~/components/layouts/DynamicLayout'
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

IndexPage.getLayout = (page) => <DynamicLayout>{page}</DynamicLayout>

export default IndexPage
