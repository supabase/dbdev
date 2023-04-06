import { dehydrate, QueryClient } from '@tanstack/react-query'
import { GetStaticPaths, GetStaticProps } from 'next'
import DynamicLayout from '~/components/layouts/DynamicLayout'
import Markdown from '~/components/ui/Markdown'
import H1 from '~/components/ui/typography/H1'
import H2 from '~/components/ui/typography/H2'
import {
  prefetchPackageVersions,
  usePackageVersionsQuery,
} from '~/data/package-versions/package-versions-query'
import { prefetchPackage, usePackageQuery } from '~/data/packages/package-query'
import { getAllPackages } from '~/data/static-path-queries'
import { NotFoundError } from '~/data/utils'
import { NextPageWithLayout } from '~/lib/types'
import { firstStr, useParams } from '~/lib/utils'

const PackagePage: NextPageWithLayout = () => {
  const { handle, package: partialPackageName } = useParams()
  const { data: pkg, isSuccess: isPkgSuccess } = usePackageQuery({
    handle,
    partialName: partialPackageName,
  })
  const { data: pkgVersions, isSuccess: isPkgVersionsSuccess } =
    usePackageVersionsQuery({
      handle,
      partialName: partialPackageName,
    })

  return (
    <div className="flex flex-col gap-8 mb-16">
      {isPkgSuccess && (
        <div className="flex flex-col gap-8">
          <H1>{pkg.package_name}</H1>

          <Markdown>{pkg.description_md}</Markdown>
        </div>
      )}

      {isPkgVersionsSuccess && (
        <div className="flex flex-col gap-2">
          <H2>Versions</H2>

          <div className="flex flex-col gap-1">
            {pkgVersions.map((pkgVersion) => (
              <div key={pkgVersion.id}>
                <h2>{pkgVersion.version}</h2>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const allPackages = await getAllPackages()

  return {
    paths: allPackages.map(({ handle, partial_name }) => ({
      params: { handle, package: partial_name },
    })),
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const queryClient = new QueryClient()

  if (params?.handle && params?.package) {
    const handle = firstStr(params.handle)
    const partialPackageName = firstStr(params.package)

    try {
      await Promise.all([
        prefetchPackage(queryClient, {
          handle,
          partialName: partialPackageName,
        }),
        prefetchPackageVersions(queryClient, {
          handle,
          partialName: partialPackageName,
        }),
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

PackagePage.getLayout = (page) => <DynamicLayout>{page}</DynamicLayout>

export default PackagePage
