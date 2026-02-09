import Link from 'next/link'
import { source } from '~/lib/source'
import { Sidebar } from '~/components/docs/Sidebar'

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const tree = source.pageTree

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-semibold text-lg">
              dbdev
            </Link>
            <span className="text-muted-foreground text-sm">/</span>
            <Link
              href="/docs"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Documentation
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to site
            </Link>
            <a
              href="https://github.com/supabase/dbdev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 flex gap-8 py-8">
        <Sidebar tree={tree} />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}
