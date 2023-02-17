import { dehydrate, QueryClient } from '@tanstack/react-query'
import { GetStaticPaths, GetStaticProps } from 'next'
import Link from 'next/link'
import DynamicLayout from '~/components/layouts/DynamicLayout'
import { prefetchProfile, useProfileQuery } from '~/data/profiles/profile-query'
import { NotFoundError } from '~/data/utils'
import { DEFAULT_AVATAR_SRC_URL } from '~/lib/avatars'
import { NextPageWithLayout } from '~/lib/types'
import { firstStr, useParams } from '~/lib/utils'

const AccountPage: NextPageWithLayout = () => {
  const { handle } = useParams()
  const { data: profile } = useProfileQuery({ handle })

  return (
    <div>
      <h1>hello {handle}</h1>

      <img
        src={profile?.avatar_url ?? DEFAULT_AVATAR_SRC_URL}
        alt={`${profile?.display_name || handle}'s avatar`}
        className="rounded-full"
      />

      <Link
        href={{
          pathname: '/profiles/[handle]/[package]',
          query: { handle: handle, package: 'math' },
        }}
        as={`/@${handle}/math`}
      >
        math package
      </Link>
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [{ params: { handle: 'alaister' } }],
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const queryClient = new QueryClient()

  if (params?.handle) {
    try {
      await prefetchProfile(queryClient, { handle: firstStr(params.handle) })
    } catch (error) {
      if (error instanceof NotFoundError) {
        return {
          notFound: true,
          revalidate: 60 * 5, // 5 minutes
        }
      }

      throw error
    }
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 60 * 5, // 5 minutes
  }
}

AccountPage.getLayout = (page) => <DynamicLayout>{page}</DynamicLayout>

export default AccountPage
