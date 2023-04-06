import { dehydrate, QueryClient } from '@tanstack/react-query'
import { GetStaticPaths, GetStaticProps } from 'next'
import DynamicLayout from '~/components/layouts/DynamicLayout'
import CopyButton from '~/components/ui/CopyButton'
import Markdown from '~/components/ui/Markdown'
import Tabs, { TabsContent, TabsList, TabsTrigger } from '~/components/ui/Tabs'
import H1 from '~/components/ui/typography/H1'
import H2 from '~/components/ui/typography/H2'
import {
  prefetchPackageVersions,
  usePackageVersionsQuery,
} from '~/data/package-versions/package-versions-query'
import { prefetchPackage, usePackageQuery } from '~/data/packages/package-query'
import { getAllPackages } from '~/data/static-path-queries'
import { NotFoundError } from '~/data/utils'
import dayjs from '~/lib/dayjs'
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
      <div className="flex flex-col gap-2">
        <div className="flex items-end gap-3">
          <H1>{pkg?.package_name ?? 'Loading...'}</H1>
          {pkg && <CopyButton getValue={() => pkg.package_name} />}
        </div>

        <div className="flex items-center gap-1 text-slate-700">
          <span>{pkg?.latest_version ?? '0.0.0'}</span>
          <span>&bull;</span>
          <span>
            Created {pkg ? dayjs(pkg.created_at).fromNow() : 'Loading...'}
          </span>
        </div>
      </div>

      <Tabs defaultValue="description">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
        </TabsList>

        <TabsContent value="description">
          {isPkgSuccess && <Markdown>{pkg.description_md}</Markdown>}
        </TabsContent>

        <TabsContent value="versions">
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
        </TabsContent>
      </Tabs>
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
