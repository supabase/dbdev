import { QueryClient, dehydrate } from '@tanstack/react-query'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '~/components/layouts/Layout'
import PackageCard from '~/components/packages/PackageCard'
import Markdown from '~/components/ui/Markdown'
import {
  prefetchPopularPackages,
  usePopularPackagesQuery,
} from '~/data/packages/popular-packages-query'
import { NextPageWithLayout } from '~/lib/types'
import { Button } from '@/components/ui/button'

const IndexPage: NextPageWithLayout = ({}) => {
  const { data } = usePopularPackagesQuery()

  return (
    <>
      <Head>
        <title>dbdev | The Database Package Manager</title>
      </Head>

      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
          <h1 className="text-2xl font-bold -translate-y-10 sm:text-4xl md:text-6xl">
            The Database
            <br />
            Package Manager
          </h1>
          <p className="-mt-4 text-lg text-gray-600 dark:text-gray-400">
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
          <div className="flex flex-col sm:flex-row md:items-center mt-6 gap-4">
            <Button asChild>
              <Link href="/installer">Getting started</Link>
            </Button>
            <Button asChild variant="outline">
              <a href="https://supabase.github.io/dbdev/" target="blank">
                Documentation
              </a>
            </Button>
          </div>
        </div>
        <div className="lg:mt-0 lg:flex-shrink-0 lg:flex-grow">
          {/* Getting started section */}
          <div className="">
            <Markdown className="rounded dark:border dark:border-slate-700">
              {`\`\`\`sql
-- Install extensions via a SQL command:

select dbdev.install('olirice-index_advisor');

-- where "olirice" is the handle of the publisher 
-- and "index_advisor" is the name of the extension
\`\`\``}
            </Markdown>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center pb-20">
        {/* Popular packages section */}
        <div className="mt-8 md:mt-24 space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Popular packages
          </h2>
          <p className="text-muted-foreground">Trending on dbdev this week</p>

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
