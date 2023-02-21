import Head from 'next/head'
import Link from 'next/link'
import DynamicLayout from '~/components/layouts/DynamicLayout'
import { useUser } from '~/lib/auth'
import { NextPageWithLayout } from '~/lib/types'

const IndexPage: NextPageWithLayout = () => {
  const user = useUser()

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <div>
        <h1>Home</h1>

        <Link
          href={{
            pathname: '/profiles/[handle]',
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
