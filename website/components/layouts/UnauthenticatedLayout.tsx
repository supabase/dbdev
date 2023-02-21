import { PropsWithChildren } from 'react'
import Navbar from './Navbar'

const UnauthenticatedLayout = ({ children }: PropsWithChildren<{}>) => {
  return (
    <div className="flex flex-col h-full">
      <Navbar />

      <main className="flex flex-col flex-1 w-full max-w-3xl px-4 mx-auto mt-8">
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

export default UnauthenticatedLayout
