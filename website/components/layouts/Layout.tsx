import { PropsWithChildren } from 'react'
import { cn } from '~/lib/utils'
import Navbar from './Navbar'
import Footer from './Footer'

export type LayoutProps = {
  gradientBg?: boolean
  containerWidth?: 'md' | 'full'
}

const Layout = ({
  gradientBg = false,
  containerWidth = 'md',
  children,
}: PropsWithChildren<LayoutProps>) => {
  return (
    <div
      className={cn(
        'flex flex-col min-h-full',
        !gradientBg
          ? 'bg-white dark:bg-slate-900'
          : 'bg-gradient-to-b from-gray-100 via-gray-100 to-white dark:from-slate-900 dark:to-slate-800'
      )}
    >
      <Navbar />

      <main
        className={cn(
          'flex flex-col flex-1 w-full mt-8',
          containerWidth === 'md' ? 'max-w-4xl 2xl:max-w-3xl px-4 mx-auto' : ''
        )}
      >
        {children}
      </main>

      <Footer gradientBg />
    </div>
  )
}

export default Layout
