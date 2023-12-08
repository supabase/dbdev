import { ArrowDownTrayIcon, BookOpenIcon } from '@heroicons/react/24/outline'
import { dehydrate, QueryClient } from '@tanstack/react-query'
import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import Layout from '~/components/layouts/Layout'
import CopyButton from '~/components/ui/CopyButton'
import Link from '~/components/ui/Link'
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
import { firstStr, pluralize, useParams } from '~/lib/utils'
import FourOhFourPage from '../404'

const PackagePage: NextPageWithLayout = () => {
  const { handle, package: partialPackageName } = useParams()
  const {
    data: pkg,
    isSuccess: isPkgSuccess,
    isError,
    error,
  } = usePackageQuery({
    handle,
    partialName: partialPackageName,
  })
  const { data: pkgVersions, isSuccess: isPkgVersionsSuccess } =
    usePackageVersionsQuery({
      handle,
      partialName: partialPackageName,
    })

  const installCode = `select dbdev.install('${
    pkg?.package_alias ?? pkg?.package_name ?? 'Loading...'
  }');
create extension "${pkg?.package_alias ?? pkg?.package_name ?? 'Loading...'}"
    version '${pkg?.latest_version ?? '0.0.0'}';`

  const downloads30Days = pkg?.download_metrics?.downloads_30_day ?? 0
  const downloads90Days = pkg?.download_metrics?.downloads_90_days ?? 0
  const downloads180Days = pkg?.download_metrics?.downloads_180_days ?? 0
  const downloadsAllTime = pkg?.download_metrics?.downloads_all_time ?? 0

  if (isError) {
    if (error instanceof NotFoundError) {
      return <FourOhFourPage title="Package not found" />
    }
  }

  return (
    <>
      <Head>
        <title>
          {`${pkg ? `${pkg.package_alias ?? pkg.package_name} | ` : ''}The Database Package Manager`}
        </title>
      </Head>

      <div className="flex flex-col w-full gap-8 px-4 mx-auto mb-16 max-w-7xl">
        <div className="flex flex-col gap-2">
          <div className="flex items-end gap-3">
            <H1>{pkg?.package_alias ?? pkg?.package_name ?? 'Loading...'}</H1>
            {pkg && <CopyButton getValue={() => pkg.package_alias ?? pkg.package_name} />}
          </div>

          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mt-4">
            <span className="font-mono">v{pkg?.latest_version ?? '0.0.0'}</span>
            <span>&bull;</span>
            <span>
              Created {pkg ? dayjs(pkg.created_at).fromNow() : 'Loading...'}
            </span>
            <span>&bull;</span>
            <span>
              By <Link href={`/${pkg?.handle ?? ''}`}>{pkg?.handle ?? ''}</Link>
            </span>
          </div>
        </div>

        <Tabs defaultValue="description">
          <TabsList>
            <TabsTrigger
              value="description"
              className="data-[state=active]:border-b-2 border-slate-700"
            >
              Description
            </TabsTrigger>
            <TabsTrigger
              value="versions"
              className="data-[state=active]:border-b-2 border-slate-700"
            >
              Versions
            </TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 gap-x-2 md:grid-cols-6">
            <div className="md:col-span-4">
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
                          <h2 className="dark:text-white">
                            {pkgVersion.version}
                          </h2>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </div>

            <div className="flex h-min flex-col gap-8 mt-2 rounded-md border border-slate-200 dark:border-slate-700 p-6 min-h-[64px] order-first md:order-last md:col-span-2">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between pb-1 border-b border-b-slate-200">
                  <H2 variant="borderless" className="flex items-center gap-2">
                    <ArrowDownTrayIcon className="w-5 h-5" /> Install
                  </H2>

                  {pkg && <CopyButton getValue={() => installCode} />}
                </div>

                <ol role="list" className="list-decimal list-inside">
                  <li className="dark:text-white">
                    <Link href="/installer">
                      Install the <code>dbdev</code> package manager
                    </Link>
                  </li>
                  <li className="dark:text-white">Install the package:</li>
                </ol>

                <Markdown copyableCode={false}>
                  {`\`\`\`sql
${installCode}
\`\`\``}
                </Markdown>
              </div>

              <div className="flex flex-col gap-3">
                <H2 className="flex items-center gap-2">
                  <BookOpenIcon className="w-5 h-5" /> Downloads
                </H2>

                <ul className="flex flex-col gap-1 text-sm dark:text-white">
                  <li>
                    {downloadsAllTime ?? 0} all time{' '}
                    {pluralize(downloadsAllTime, 'download')}
                  </li>
                  <li>
                    {downloads30Days ?? 0}{' '}
                    {pluralize(downloads30Days, 'download')} in the last 30{' '}
                    {pluralize(downloads30Days, 'day')}
                  </li>
                  <li>
                    {downloads90Days ?? 0}{' '}
                    {pluralize(downloads90Days, 'download')} in the last 90{' '}
                    {pluralize(downloads90Days, 'day')}
                  </li>
                  <li>
                    {downloads180Days ?? 0}{' '}
                    {pluralize(downloads180Days, 'download')} in the last 180{' '}
                    {pluralize(downloads180Days, 'day')}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Tabs>
      </div>
    </>
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

PackagePage.getLayout = (page) => <Layout containerWidth="full">{page}</Layout>

export default PackagePage
