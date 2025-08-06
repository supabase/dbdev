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
  th({ node, className, children, ...props }) {
    return (
      <th className={cn('font-semibold dark:text-white', className)} {...props}>
        {children}
      </th>
    )
  },
  td({ node, className, children, ...props }) {
    return (
      <td className={cn('dark:text-white', className)} {...props}>
        {children}
      </td>
    )
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
