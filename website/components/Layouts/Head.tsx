import Head from 'next/head'
import { SITE_INFO } from '../../lib/constants'

export type HeadProps = {
  title?: string
  description?: string
}

export default function SiteHead({ title, description }: HeadProps) {
  return (
    <Head>
      <title>{title || SITE_INFO.name}</title>
      <meta name="description" content={description || SITE_INFO.description} />
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="shortcut icon" href="/images/favicon-dbdev.png" />
      <meta name="theme-color" content="#000000" />
      <meta name="robots" content="index, follow" />
      <link href="URL" rel="canonical" />

      <meta name="og:title" property="og:title" content={title || SITE_INFO.name} />
      <meta name="og:type" property="og:type" content="website" />
      <meta name="og:image" property="og:image" content=""></meta>
      <meta
        name="og:description"
        property="og:description"
        content={description || SITE_INFO.description}
      />
    </Head>
  )
}
