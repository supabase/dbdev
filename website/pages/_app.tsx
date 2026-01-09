import { Inter } from 'next/font/google'
import { HydrationBoundary, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import { ThemeContextProvider } from '~/components/themes/ThemeContext'
import { useRootQueryClient } from '~/data/query-client'
import { AuthProvider } from '~/lib/auth'
import { AppPropsWithLayout } from '~/lib/types'
import { cn } from '~/lib/utils'
import '~/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

const CustomApp = ({ Component, pageProps }: AppPropsWithLayout) => {
  const queryClient = useRootQueryClient()

  const getLayout = Component.getLayout ?? ((page) => page)

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={pageProps.dehydratedState}>
        <AuthProvider>
          <ThemeContextProvider>
            <div className={cn(inter.className, 'h-full')}>
              {getLayout(<Component {...pageProps} />)}
            </div>
          </ThemeContextProvider>
        </AuthProvider>

        <Toaster position="bottom-left" />
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      </HydrationBoundary>
    </QueryClientProvider>
  )
}

export default CustomApp
