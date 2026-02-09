'use client'

import { useEffect, useState } from 'react'
import type { TableOfContents as TOCType } from 'fumadocs-core/toc'
import { cn } from '~/lib/cn'

export function TableOfContents({ toc }: { toc: TOCType }) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '0px 0px -80% 0px' }
    )

    for (const item of toc) {
      const id = item.url.slice(1)
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }

    return () => observer.disconnect()
  }, [toc])

  if (toc.length === 0) return null

  return (
    <nav className="w-56 shrink-0 hidden xl:block">
      <div className="sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto">
        <p className="text-sm font-semibold mb-3">On this page</p>
        <ul className="space-y-1.5 text-sm">
          {toc.map((item) => {
            const id = item.url.slice(1)
            return (
              <li
                key={item.url}
                style={{ paddingLeft: `${(item.depth - 2) * 12}px` }}
              >
                <a
                  href={item.url}
                  className={cn(
                    'block py-0.5 transition-colors',
                    activeId === id
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {item.title}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
