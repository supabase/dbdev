import { PropsWithChildren } from 'react'
import { cn } from '~/lib/utils'
import Navbar from './Navbar'

export type LayoutProps = {
  containerWidth?: 'md' | 'full'
}

const Layout = ({
  containerWidth = 'md',
  children,
}: PropsWithChildren<LayoutProps>) => {
  return (
    <div className="flex flex-col h-full">
      <Navbar />

      <main
        className={cn(
          'flex flex-col flex-1 w-full mt-8',
          containerWidth === 'md' && 'max-w-3xl px-4 mx-auto'
        )}
      >
        {children}
      </main>

      <footer className="flex w-full h-12 px-4 border-t">
        <a
          className="flex items-center justify-center gap-2"
          href="https://supabase.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          &copy; Supabase
        </a>
      </footer>
    </div>
  )
}

export default Layout
