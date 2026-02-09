import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export function DocsBreadcrumb({
  items,
}: {
  items: { name: string; url?: string }[]
}) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
      <Link href="/docs" className="hover:text-foreground transition-colors">
        Docs
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5" />
          {item.url ? (
            <Link
              href={item.url}
              className="hover:text-foreground transition-colors"
            >
              {item.name}
            </Link>
          ) : (
            <span className="text-foreground">{item.name}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
