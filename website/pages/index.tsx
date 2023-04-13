import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid'
import { QueryClient, dehydrate } from '@tanstack/react-query'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '~/components/layouts/Layout'
import PackageCard from '~/components/packages/PackageCard'
import Search from '~/components/search/Search'
import Markdown from '~/components/ui/Markdown'
import {
  prefetchPopularPackages,
  usePopularPackagesQuery,
} from '~/data/packages/popular-packages-query'
import { NextPageWithLayout } from '~/lib/types'

const IndexPage: NextPageWithLayout = () => {
  const { data } = usePopularPackagesQuery()

  return (
    <>
      <Head>
        <title>dbdev | The Database Package Manager</title>
      </Head>

      <div className="flex flex-col justify-center pb-20">
        <div className="mt-44">
          <h1 className="text-2xl font-bold text-gray-900 -translate-y-10 dark:text-gray-100 sm:text-4xl md:text-7xl">
            The Database
            <br />
            <span
              className="font-extrabold bg-center bg-no-repeat bg-cover bg-clip-text"
              style={{
                color: 'transparent',
                backgroundImage:
                  "url('https://i.giphy.com/media/2tNvsKkc0qFdNhJmKk/giphy.webp'",
              }}
            >
              Package Manager
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-xl -mt-4">
            For PostgreSQL trusted language extensions{' '}
            <Link
              href="https://github.com/aws/pg_tle"
              className="transition border-b-2 border-gray-300 hover:border-gray-500 dark:border-slate-700 dark:hover:border-slate-500"
            >
              (TLEs)
            </Link>
          </p>
          <div className="flex items-center mt-6 space-x-4">
            <Link
              href="/"
              className="px-4 py-2 font-bold text-white rounded-md bg-gradient-to-br from-cyan-400 to-indigo-300 dark:from-cyan-400 dark:to-indigo-300"
            >
              Getting started
            </Link>
            <Link
              href="https://supabase.com/blog/dbdev-package-manager"
              className="flex items-center px-4 py-2 space-x-2 text-gray-500 transition bg-white border rounded-md group dark:bg-transparent dark:border-slate-500 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:border-slate-400 hover:text-gray-700 hover:border-gray-400"
            >
              <p>Read the blog post</p>
              <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-400 transition group-hover:text-gray-600 dark:group-hover:text-gray-200" />
            </Link>
          </div>
        </div>

        {/* Popular packages section */}
        <div className="mt-24 space-y-4">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Popular packages
          </p>
          <div className="grid grid-cols-12 gap-4">
            {data?.map((pkg: any) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </div>

        <div className="bg-gray-200 dark:bg-slate-700 mt-20 px-8 pb-6 pt-4 rounded-lg shadow-xl">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Search for a package
          </p>
          <Search />
        </div>

        {/* First time here section */}
        <div id="getting-started" className="mt-24 space-y-4">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            First time?
          </p>
          <div className="space-y-2">
            <p className="dark:text-white">
              Install the dbdev client in your PostgreSQL database by following
              the guide{' '}
              <Link href="/installer" className="border-b">
                here
              </Link>
            </p>
          </div>
        </div>

        {/* Getting started section */}
        <div id="getting-started" className="mt-24 space-y-4">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Getting started
          </p>
          <div className="space-y-2">
            <p className="dark:text-white">
              Simply install{' '}
              <code className="text-sm bg-gray-200 dark:bg-slate-600 px-1 py-1 rounded">
                pglets
              </code>{' '}
              via a SQL command
            </p>
            <Markdown className="rounded dark:border dark:border-slate-700">
              {`\`\`\`sql
select dbdev.install('olirice-index_advisor');
\`\`\``}
            </Markdown>
          </div>
          <p className="dark:text-white">
            Where{' '}
            <code className="text-sm bg-gray-200 dark:bg-slate-600 px-1 py-1 rounded">
              olirice
            </code>{' '}
            is the handle of the publisher and{' '}
            <code className="text-sm bg-gray-200 dark:bg-slate-600 px-1 py-1 rounded">
              index_advisor
            </code>{' '}
            is the name of the pglet.
          </p>
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

IndexPage.getLayout = (page) => <Layout gradientBg>{page}</Layout>

export default IndexPage
