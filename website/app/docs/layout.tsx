import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import type { ReactNode } from 'react'
import { source } from '@/lib/source'

function Logo() {
  return (
    <>
      <style>{`
        .dark .logo-light { display: none; }
        .dark .logo-dark { display: block; }
      `}</style>
      <img
        src="/images/dbdev-lightmode.png"
        alt="dbdev logo"
        className="logo-light"
        style={{ height: 20, display: 'block' }}
      />
      <img
        src="/images/dbdev-darkmode.png"
        alt="dbdev logo"
        className="logo-dark"
        style={{ height: 20, display: 'none' }}
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
