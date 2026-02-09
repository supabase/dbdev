import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Item } from 'fumadocs-core/page-tree'

export function DocsPagination({
  previous,
  next,
}: {
  previous?: Item
  next?: Item
}) {
  if (!previous && !next) return null

  return (
    <div className="flex justify-between mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
      {previous ? (
        <Link
          href={previous.url}
          className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>{previous.name}</span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={next.url}
          className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>{next.name}</span>
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : (
        <div />
      )}
    </div>
  )
}
