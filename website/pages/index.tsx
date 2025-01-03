import { QueryClient, dehydrate } from '@tanstack/react-query'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '~/components/layouts/Layout'
import PackageCard from '~/components/packages/PackageCard'

import CopyButton from '~/components/ui/CopyButton'
import Markdown from '~/components/ui/Markdown'
import { Button } from '~/components/ui/Button'
import {
  prefetchPopularPackages,
  usePopularPackagesQuery,
} from '~/data/packages/popular-packages-query'
import { NextPageWithLayout } from '~/lib/types'

const IndexPage: NextPageWithLayout = ({ }) => {
  const { data } = usePopularPackagesQuery()

  return (
    <>
      <Head>
        <title>dbdev | The Database Package Manager</title>
      </Head>

      <div className="mx-auto container py-8 sm:py-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:pt-40 lg:pb-24">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto md:text-center lg:text-left">
          <h1
            className="text-2xl font-bold -translate-y-10 sm:text-4xl md:text-6xl
            leading-tight tracking-tighter lg:leading-[1.125]"
          >
            The Database
            <br />
            Package Manager
          </h1>
          <p className="-mt-4 text-lg text-gray-600 dark:text-gray-400 text-muted-foreground">
            For Postgres{' '}
            <a
              href="https://github.com/aws/pg_tle"
              className="transition border-b-2 border-gray-300 hover:border-gray-500 dark:border-slate-700 dark:hover:border-slate-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              Trusted Language Extensions
            </a>
          </p>
          <div className="flex flex-col sm:flex-row md:items-center mt-6 gap-4 md:justify-center lg:justify-start">
            <Button variant="default" asChild>
              <Link href="/installer">Getting started</Link>
            </Button>
            <Button asChild variant="secondary">
              <a href="https://supabase.github.io/dbdev/" target="blank">
                Documentation
              </a>
            </Button>
          </div>
        </div>
        <div className="mt-4 md:mt-12 lg:-mt-16 lg:flex-shrink-0 md:text-center lg:text-left">
          <div className="relative border px-4 pt-4 pb-4 md:pb-24 rounded-md justify-end">
            <div>
              <div>
                <h3 className="text-lg font-bold">Download and install</h3>
                <p className="text-xs text-muted-foreground">
                  Install extensions via a SQL command
                </p>
              </div>
              <div className="mt-4 relative">
                <code className="block md:inline overflow-scroll py-2">
                  <span className="text-muted-foreground">
                    select dbdev.install(
                  </span>
                  <span>
                    <span className="bg-slate-100 rounded-sm p-1 dark:bg-slate-700 relative">
                      <span className="text-red-500">olirice</span>
                      <div className="hidden md:block  bg-slate-50 absolute -left-14 -bottom-6">
                        <div className="absolute left-0 top-6 text-xs uppercase whitespace-nowrap text-muted-foreground">
                          Publisher handle
                        </div>
                        <div className="w-12 h-[1px] bg-slate-500 -rotate-45 absolute left-12"></div>
                      </div>
                    </span>
                    <span className="text-red-500">@</span>
                    <span className="bg-slate-100 dark:bg-slate-700 rounded-sm p-1 relative">
                      <span className="text-red-500">index_advisor</span>
                      <div className="hidden md:block bg-slate-50 absolute right-32 -bottom-6">
                        <div className="absolute left-8 top-6 text-xs uppercase whitespace-nowrap text-muted-foreground">
                          Extension name
                        </div>
                        <div className="w-12 h-[1px] bg-slate-500 rotate-45 absolute left-12"></div>
                      </div>
                    </span>
                    <span className="text-muted-foreground">);</span>
                  </span>
                </code>
              </div>
              <CopyButton
                getValue={() =>
                  `select dbdev.install('olirice-index_advisor');`
                }
                className="absolute top-2 right-2 p-1"
                variant="light"
              />
            </div>
            {/* <Markdown className="rounded dark:border dark:border-slate-700">
              {`\`\`\`sql

select dbdev.install('olirice-index_advisor');

-- where "olirice" is the handle of the publisher
-- and "index_advisor" is the name of the extension
\`\`\``}
            </Markdown> */}
          </div>
        </div>
      </div>
      <hr />
      <div className="container flex flex-col justify-center pb-20 ">
        {/* Popular packages section */}
        <div className="mt-6 md:mt-20 space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Popular packages
          </h2>
          <p className="text-muted-foreground">Trending on database.dev</p>

          <div className="grid sm:grid-cols-8 md:grid-cols-12 gap-4">
            {data?.map((pkg: any) => <PackageCard key={pkg.id} pkg={pkg} />)}
          </div>
        </div>
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const queryClient = new QueryClient()

  try {
    await prefetchPopularPackages(queryClient)
  } catch (_error) {
    return {
      notFound: true,
      revalidate: 60 * 1, // 1 minute
    }
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 60 * 60, // 60 minutes
  }
}

IndexPage.getLayout = (page) => <Layout containerWidth="full">{page}</Layout>

export default IndexPage
