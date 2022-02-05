import Nav from '../Site/Nav'
import Footer from '../Site/Footer'
import { ReactElement } from 'react'

type Props = {
  children: ReactElement
  sidebar: ReactElement
}

export default function RightSidebar({ children, sidebar }: Props) {
  return (
    <>
      <div className="min-h-full">
        <Nav />
        <main>
          <div className="grid grid-cols-1 items-start lg:grid-cols-3 divide-x">
            {/* Left column */}
            <div className="grid grid-cols-1 gap-4 lg:col-span-2 divide-y">{children}</div>
            {/* Right column */}
            <div className="grid grid-cols-1 gap-4 ">{sidebar}</div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}
