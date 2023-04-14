import { ComponentPropsWithoutRef } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { cn } from '~/lib/utils'
import CopyButton from './CopyButton'
import A from './typography/A'
import H1 from './typography/H1'
import H2 from './typography/H2'
import Li from './typography/Li'
import P from './typography/P'
import Strong from './typography/Strong'

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
  code({ node, inline, className, children, ...props }) {
    return (
      <code
        {...props}
        className={cn('relative', inline && 'dark:text-white', className)}
      >
        {children}
      </code>
    )
  },
  a({ children, ...props }) {
    return <A {...props}>{children}</A>
  },
  p({ children, ...props }) {
    return <P {...props}>{children}</P>
  },
  li({ children, ...props }) {
    return <Li {...props}>{children}</Li>
  },
  strong({ children, ...props }) {
    return <Strong {...props}>{children}</Strong>
  },
  h1({ children, ...props }) {
    return <H1 {...props}>{children}</H1>
  },
  h2({ children, ...props }) {
    return <H2 {...props}>{children}</H2>
  },
}

const COPYABLE_CODE_COMPONENTS: MarkdownProps['components'] = {
  code({ node, inline, className, children, ...props }) {
    return (
      <code
        {...props}
        className={cn('relative', inline && 'dark:text-white', className)}
      >
        {!inline && (
          <CopyButton
            getValue={() => childrenToText(children)}
            className="absolute top-0 right-0"
            variant="dark"
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
  linkTarget = '_blank',
  components,
  copyableCode = true,
  children,
  ...props
}: MarkdownProps) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm, ...remarkPlugins]}
    rehypePlugins={[rehypeHighlight, ...rehypePlugins]}
    linkTarget={linkTarget}
    className={cn('prose max-w-none', className)}
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
