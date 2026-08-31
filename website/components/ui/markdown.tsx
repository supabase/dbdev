import { ComponentPropsWithoutRef } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { cn } from '~/lib/utils'
import CopyButton from './copy-button'
import A from './typography/a'
import H1 from './typography/h1'
import H2 from './typography/h2'
import H3 from './typography/h3'
import Li from './typography/li'
import P from './typography/p'
import Strong from './typography/strong'

type MarkdownProps = ComponentPropsWithoutRef<typeof ReactMarkdown> & {
  copyableCode?: boolean
}

function childrenToText(children: any): string {
  if (typeof children === 'string') {
    return children
  }

  if (Array.isArray(children)) {
    return children.map(childrenToText).join('')
  }

  if (children.props && children.props.children) {
    return childrenToText(children.props.children)
  }

  return ''
}

const DEFAULT_COMPONENTS: MarkdownProps['components'] = {
  pre({ node, children, className, ...props }) {
    return (
      <pre {...props} className={cn('relative', className)}>
        {children}
      </pre>
    )
  },
  code({ node, className, children, ...props }) {
    const isInline = !className?.includes('language-')
    return (
      <code {...props} className={cn(isInline && 'dark:text-white', className)}>
        {children}
      </code>
    )
  },
  a({ node, children, ...props }) {
    return <A {...props}>{children}</A>
  },
  p({ node, children, ...props }) {
    return <P {...props}>{children}</P>
  },
  li({ node, children, ...props }) {
    return <Li {...props}>{children}</Li>
  },
  strong({ node, children, ...props }) {
    return <Strong {...props}>{children}</Strong>
  },
  h1({ node, children, ...props }) {
    return <H1 {...props}>{children}</H1>
  },
  h2({ node, children, ...props }) {
    return <H2 {...props}>{children}</H2>
  },
  h3({ node, children, ...props }) {
    return <H3 {...props}>{children}</H3>
  },
  blockquote({ node, className, children, ...props }) {
    return (
      <blockquote
        className={cn(
          'border-l-4 border-slate-300 dark:border-slate-600 pl-4 italic text-slate-700 dark:text-slate-300 my-4',
          className
        )}
        {...props}
      >
        {children}
      </blockquote>
    )
  },
  ul({ node, className, children, ...props }) {
    return (
      <ul className={cn('list-disc list-inside space-y-1 my-3', className)} {...props}>
        {children}
      </ul>
    )
  },
  ol({ node, className, children, ...props }) {
    return (
      <ol className={cn('list-decimal list-inside space-y-1 my-3', className)} {...props}>
        {children}
      </ol>
    )
  },
  table({ node, className, children, ...props }) {
    return (
      <div className="overflow-x-auto my-4 rounded-lg border border-slate-200 dark:border-slate-700">
        <table className={cn('min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-sm', className)} {...props}>
          {children}
        </table>
      </div>
    )
  },
  thead({ node, className, children, ...props }) {
    return (
      <thead className={cn('bg-slate-50 dark:bg-slate-800', className)} {...props}>
        {children}
      </thead>
    )
  },
  tbody({ node, className, children, ...props }) {
    return (
      <tbody className={cn('divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900', className)} {...props}>
        {children}
      </tbody>
    )
  },
  tr({ node, className, children, ...props }) {
    return (
      <tr className={cn('transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50', className)} {...props}>
        {children}
      </tr>
    )
  },
  th({ node, className, children, ...props }) {
    return (
      <th className={cn('px-4 py-3 text-left font-semibold text-slate-900 dark:text-white', className)} {...props}>
        {children}
      </th>
    )
  },
  td({ node, className, children, ...props }) {
    return (
      <td className={cn('px-4 py-3 text-slate-700 dark:text-slate-300', className)} {...props}>
        {children}
      </td>
    )
  },
  input({ node, className, ...props }) {
    if (props.type === 'checkbox') {
      return (
        <input
          type="checkbox"
          className={cn('mr-2 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500', className)}
          disabled
          {...props}
        />
      )
    }
    return <input className={className} {...props} />
  },
}

const COPYABLE_CODE_COMPONENTS: MarkdownProps['components'] = {
  code({ node, className, children, ...props }) {
    const isInline = !className?.includes('language-')
    return (
      <code {...props} className={cn(isInline && 'dark:text-white', className)}>
        {!isInline && (
          <CopyButton
            getValue={() => childrenToText(children)}
            className="absolute top-2 right-2"
            variant="light"
          />
        )}

        {children}
      </code>
    )
  },
}

const Markdown = ({
  className,
  remarkPlugins = [],
  rehypePlugins = [],
  components,
  copyableCode = true,
  children,
  ...props
}: MarkdownProps) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm, ...(remarkPlugins || [])]}
    rehypePlugins={[rehypeHighlight, ...(rehypePlugins || [])]}
    className={cn('prose lg:prose-xl max-w-none', className)}
    components={{
      ...DEFAULT_COMPONENTS,
      ...(copyableCode ? COPYABLE_CODE_COMPONENTS : undefined),
      ...components,
    }}
    {...props}
  >
    {children}
  </ReactMarkdown>
)

export default Markdown
