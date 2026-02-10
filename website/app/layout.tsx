import { RootProvider } from 'fumadocs-ui/provider'
import type { ReactNode } from 'react'
import 'fumadocs-ui/style.css'
import '../styles/globals.css'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="flex flex-col min-h-screen"
        style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}
      >
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  )
}
