import Nav from '../Site/Nav'
import Footer from '../Site/Footer'
import { ReactElement } from 'react'
import Head, { HeadProps } from './Head'

type Props = {
  children: ReactElement
} & HeadProps

export default function RightSidebar({ children, title, description }: Props) {
  return (
    <div>
      <Head title={title} description={description} />
      <div className="min-h-full">
        <Nav />
        <main>
          <div className="grid grid-cols-1 items-start lg:grid-cols-1">{children}</div>
        </main>
        <Footer />
      </div>
    </div>
  )
}
