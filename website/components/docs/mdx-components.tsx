import type { MDXComponents } from 'mdx/types'
import { cn } from '~/lib/cn'
import { Callout } from './Callout'
import { Tabs, Tab } from './Tabs'

export function getMDXComponents(): MDXComponents {
  return {
    Callout,
    Tabs,
    Tab,
    pre: ({ className, ...props }: React.ComponentProps<'pre'>) => (
      <pre
        {...props}
        className={cn(
          'rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-950 text-gray-50 p-4 mb-4 overflow-x-auto text-sm font-mono not-prose',
          className
        )}
      />
    ),
    code: ({ className, ...props }: React.ComponentProps<'code'>) => {
      // Block code inside <pre> has a className like "language-xxx"
      const isBlock =
        typeof className === 'string' && className.includes('language-')
      if (isBlock) {
        return <code className={className} {...props} />
      }
      return (
        <code
          {...props}
          className={cn(
            'rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-sm font-mono not-prose',
            className
          )}
        />
      )
    },
  }
}
