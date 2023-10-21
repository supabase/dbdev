import { PropsWithChildren } from 'react'
import { cn } from '~/lib/utils'
import Navbar from './Navbar'
import Footer from './Footer'

export type LayoutProps = {
  gradientBg?: boolean
  containerWidth?: 'md' | 'full'
}

const Layout = ({
  containerWidth = 'md',
  children,
}: PropsWithChildren<LayoutProps>) => {
  return (
    <div>
      <Navbar />

      <main
        className={cn(
          'flex flex-col flex-1 w-full mt-8',
          containerWidth === 'md'
            ? 'max-w-4xl 2xl:max-w-3xl px-4 mx-auto'
            : 'px-4'
        )}
      >
        {children}
      </main>

      <Footer />
    </div>
  )
}

export default Layout
