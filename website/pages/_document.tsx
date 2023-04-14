import { Head, Html, Main, NextScript } from 'next/document'

const CustomDocument = () => {
  return (
    <Html lang="en">
      <Head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github-dark.min.css"
        />
      </Head>
      <body className="light">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

export default CustomDocument
