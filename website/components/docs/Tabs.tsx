'use client'

import { useState } from 'react'
import { cn } from '~/lib/utils'

export function Tabs({
  items,
  children,
}: {
  items: string[]
  children: React.ReactNode
}) {
  const [active, setActive] = useState(items[0])

  return (
    <div className="my-4">
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {items.map((item) => (
          <button
            key={item}
            onClick={() => setActive(item)}
            className={cn(
              'px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors',
              active === item
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            )}
          >
            {item}
          </button>
        ))}
      </div>
      <TabContext.Provider value={active}>{children}</TabContext.Provider>
    </div>
  )
}

import { createContext, useContext } from 'react'

const TabContext = createContext<string>('')

export function Tab({
  value,
  children,
}: {
  value: string
  children: React.ReactNode
}) {
  const active = useContext(TabContext)

  if (active !== value) return null

  return <div className="pt-4">{children}</div>
}
