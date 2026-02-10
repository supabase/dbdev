import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import type { ReactNode } from 'react'
import { source } from '@/lib/source'

function Logo() {
  return (
    <>
      <img
        src="/images/dbdev-lightmode.png"
        alt="dbdev logo"
        className="h-7 dark:hidden"
      />
      <img
        src="/images/dbdev-darkmode.png"
        alt="dbdev logo"
        className="h-7 hidden dark:block"
      />
    </>
  )
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        title: <Logo />,
        url: '/',
      }}
    >
      {children}
    </DocsLayout>
  )
}
