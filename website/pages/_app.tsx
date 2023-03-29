import { Inter } from '@next/font/google'
import { Hydrate, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import clsx from 'clsx'
import { Toaster } from 'react-hot-toast'
import { useRootQueryClient } from '~/data/query-client'
import { AuthProvider } from '~/lib/auth'
import { AppPropsWithLayout } from '~/lib/types'
import '~/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

const CustomApp = ({ Component, pageProps }: AppPropsWithLayout) => {
  const queryClient = useRootQueryClient()

  const getLayout = Component.getLayout ?? ((page) => page)

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <AuthProvider>
          <div className={clsx(inter.className, 'h-full')}>
            {getLayout(<Component {...pageProps} />)}
          </div>
        </AuthProvider>
        <Toaster position="bottom-left" />
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      </Hydrate>
    </QueryClientProvider>
  )
}

export default CustomApp
