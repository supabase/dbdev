import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import type { ReactNode } from 'react'
import { source } from '@/lib/source'

function Logo() {
  return (
    <>
      <style>{`
        .logo-light, .logo-dark { height: 28px; }
        .logo-dark { display: none !important; }
        .dark .logo-light { display: none !important; }
        .dark .logo-dark { display: block !important; }
      `}</style>
      <img
        src="/images/dbdev-lightmode.png"
        alt="dbdev logo"
        className="logo-light"
      />
      <img
        src="/images/dbdev-darkmode.png"
        alt="dbdev logo"
        className="logo-dark"
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
