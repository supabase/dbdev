'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type * as PageTree from 'fumadocs-core/page-tree'
import { cn } from '~/lib/cn'

function SidebarItem({ item }: { item: PageTree.Item }) {
  const pathname = usePathname()
  const isActive = pathname === item.url

  return (
    <li>
      <Link
        href={item.url}
        className={cn(
          'block py-1.5 px-3 text-sm rounded-md transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground font-medium'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        )}
      >
        {item.name}
      </Link>
    </li>
  )
}

function SidebarFolder({ folder }: { folder: PageTree.Folder }) {
  return (
    <li>
      {folder.index ? (
        <SidebarItem item={folder.index} />
      ) : (
        <span className="block py-1.5 px-3 text-sm font-semibold text-foreground">
          {folder.name}
        </span>
      )}
      {folder.children.length > 0 && (
        <ul className="ml-3 border-l border-gray-200 dark:border-gray-700 pl-2 mt-1 space-y-0.5">
          <SidebarNodes nodes={folder.children} />
        </ul>
      )}
    </li>
  )
}

function SidebarNodes({ nodes }: { nodes: PageTree.Node[] }) {
  return (
    <>
      {nodes.map((node, i) => {
        if (node.type === 'page') {
          return <SidebarItem key={i} item={node} />
        }
        if (node.type === 'folder') {
          return <SidebarFolder key={i} folder={node} />
        }
        if (node.type === 'separator') {
          return (
            <li key={i} className="pt-4 pb-1 px-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {node.name}
              </span>
            </li>
          )
        }
        return null
      })}
    </>
  )
}

export function Sidebar({ tree }: { tree: PageTree.Root }) {
  return (
    <nav className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto pb-8">
        <ul className="space-y-0.5">
          <SidebarNodes nodes={tree.children} />
        </ul>
      </div>
    </nav>
  )
}
