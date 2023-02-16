import Link from 'next/link'
import DynamicLayout from '~/components/layouts/DynamicLayout'
import { NextPageWithLayout } from '~/lib/types'
import { useParams } from '~/lib/utils'

const AccountPage: NextPageWithLayout = () => {
  const { handle } = useParams()

  return (
    <div>
      <h1>hello {handle}</h1>

      <Link
        href={{
          pathname: '/content/[handle]/[package]',
          query: { handle: 'foo', package: 'stats' },
        }}
        as="/@foo/stats"
      >
        stats package
      </Link>
    </div>
  )
}

AccountPage.getLayout = (page) => <DynamicLayout>{page}</DynamicLayout>

export default AccountPage
