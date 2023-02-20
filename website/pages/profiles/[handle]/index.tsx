import { dehydrate, QueryClient } from '@tanstack/react-query'
import { GetStaticPaths, GetStaticProps } from 'next'
import Link from 'next/link'
import DynamicLayout from '~/components/layouts/DynamicLayout'
import {
  prefetchPackages,
  usePackagesQuery,
} from '~/data/packages/packages-query'
import { prefetchProfile, useProfileQuery } from '~/data/profiles/profile-query'
import { getAllProfiles } from '~/data/static-path-queries'
import { NotFoundError } from '~/data/utils'
import { DEFAULT_AVATAR_SRC_URL } from '~/lib/avatars'
import { NextPageWithLayout } from '~/lib/types'
import { firstStr, useParams } from '~/lib/utils'

const AccountPage: NextPageWithLayout = () => {
  const { handle } = useParams()
  const { data: profile } = useProfileQuery({ handle })
  const { data: packages, isSuccess: isPackagesSuccess } = usePackagesQuery({
    handle,
  })

  return (
    <div>
      <h1>hello {handle}</h1>

      <img
        src={profile?.avatar_url ?? DEFAULT_AVATAR_SRC_URL}
        alt={`${profile?.display_name || handle}'s avatar`}
        className="rounded-full"
      />

      {isPackagesSuccess &&
        packages.map((pkg) => (
          <Link
            key={pkg.id}
            href={{
              pathname: '/profiles/[handle]/[package]',
              query: { handle: pkg.handle, package: pkg.partial_name },
            }}
            as={`/@${pkg.package_name}`}
          >
            {pkg.partial_name} package
          </Link>
        ))}
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const allProfiles = await getAllProfiles()

  return {
    paths: allProfiles.map((params) => ({ params })),
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const queryClient = new QueryClient()

  if (params?.handle) {
    const handle = firstStr(params.handle)

    try {
      await Promise.all([
        prefetchProfile(queryClient, { handle }),
        prefetchPackages(queryClient, { handle }),
      ])
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
