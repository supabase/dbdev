import type { MDXComponents } from 'mdx/types'
import { Callout } from './Callout'
import { Tabs, Tab } from './Tabs'

export function getMDXComponents(): MDXComponents {
  return {
    Callout,
    Tabs,
    Tab,
    h1: (props) => (
      <h1
        className="text-3xl font-bold tracking-tight mt-8 mb-4 first:mt-0"
        {...props}
      />
    ),
    h2: (props) => (
      <h2
        id={slugify(props.children)}
        className="text-2xl font-semibold tracking-tight mt-10 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 scroll-mt-20"
        {...props}
      />
    ),
    h3: (props) => (
      <h3
        id={slugify(props.children)}
        className="text-xl font-semibold tracking-tight mt-8 mb-3 scroll-mt-20"
        {...props}
      />
    ),
    h4: (props) => (
      <h4
        id={slugify(props.children)}
        className="text-lg font-semibold tracking-tight mt-6 mb-2 scroll-mt-20"
        {...props}
      />
    ),
    p: (props) => <p className="leading-7 mb-4" {...props} />,
    a: (props) => (
      <a
        className="text-blue-600 dark:text-blue-400 underline underline-offset-4 hover:text-blue-800 dark:hover:text-blue-300"
        {...props}
      />
    ),
    ul: (props) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
    ol: (props) => (
      <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />
    ),
    li: (props) => <li className="leading-7" {...props} />,
    pre: (props) => (
      <pre
        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-950 text-gray-50 p-4 mb-4 overflow-x-auto text-sm"
        {...props}
      />
    ),
    code: (props) => {
      const isInline = typeof props.children === 'string'
      if (isInline) {
        return (
          <code
            className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-sm font-mono"
            {...props}
          />
        )
      }
      return <code {...props} />
    },
    table: (props) => (
      <div className="mb-4 overflow-x-auto">
        <table
          className="w-full border-collapse text-sm"
          {...props}
        />
      </div>
    ),
    th: (props) => (
      <th
        className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left font-semibold bg-gray-50 dark:bg-gray-800"
        {...props}
      />
    ),
    td: (props) => (
      <td
        className="border border-gray-200 dark:border-gray-700 px-4 py-2"
        {...props}
      />
    ),
    hr: () => <hr className="my-8 border-gray-200 dark:border-gray-700" />,
    blockquote: (props) => (
      <blockquote
        className="border-l-4 border-gray-200 dark:border-gray-700 pl-4 my-4 text-muted-foreground italic"
        {...props}
      />
    ),
    strong: (props) => <strong className="font-semibold" {...props} />,
  }
}

function slugify(children: React.ReactNode): string {
  if (typeof children === 'string') {
    return children
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
  return ''
}
