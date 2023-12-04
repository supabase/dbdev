import Head from 'next/head'
import Link from 'next/link'
import Layout from '~/components/layouts/Layout'
import { Button } from '~/components/ui/Button'
import H1 from '~/components/ui/typography/H1'
import P from '~/components/ui/typography/P'
import { NextPageWithLayout } from '~/lib/types'

export type FourOhFourPageProps = {
  title?: string
}

const FourOhFourPage: NextPageWithLayout<FourOhFourPageProps> = ({
  title = 'Page not found',
}) => {
  return (
    <>
      <Head>
        <title>{`404 ${title} | The Database Package Manager`}</title>
      </Head>

      <div className="grid min-h-full px-6 py-24 bg-white place-items-center sm:py-32 lg:px-8">
        <div className="text-center">
          <P className="font-semibold text-indigo-600">404</P>
          <H1>{title}</H1>
          <P className="mt-6 text-base leading-7 text-gray-600">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </P>

          <Button asChild className="mt-10">
            <Link href="/">Go back home</Link>
          </Button>
        </div>
      </div>
    </>
  )
}

FourOhFourPage.getLayout = (page) => <Layout>{page}</Layout>

export default FourOhFourPage
