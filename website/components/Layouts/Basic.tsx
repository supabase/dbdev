import Nav from '../Site/Nav'
import Footer from '../Site/Footer'
import { ReactElement } from 'react'

type Props = {
  children: ReactElement
}

export default function RightSidebar({ children }: Props) {
  return (
    <>
      <div className="min-h-full">
        <Nav />
        <main>
          <div className="grid grid-cols-1 items-start lg:grid-cols-1">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}
