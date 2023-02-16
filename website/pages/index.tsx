import Head from 'next/head'
import Link from 'next/link'
import DynamicLayout from '~/components/layouts/DynamicLayout'
import { NextPageWithLayout } from '~/lib/types'

const IndexPage: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <div>
        <h1>Home</h1>

        <Link
          href={{
            pathname: '/content/[handle]',
            query: { handle: 'foo' },
          }}
          as="/@foo"
        >
          foo Profile
        </Link>
      </div>
    </>
  )
}

IndexPage.getLayout = (page) => <DynamicLayout>{page}</DynamicLayout>

export default IndexPage
