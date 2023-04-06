import { ComponentPropsWithoutRef } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { cn } from '~/lib/utils'
import CopyButton from './CopyButton'

type MarkdownProps = ComponentPropsWithoutRef<typeof ReactMarkdown>

const getDefaultComponents: (args: {
  rawMarkdown: string
}) => MarkdownProps['components'] = ({ rawMarkdown }) => ({
  code({ node, inline, className, children, ...props }) {
    return (
      <code {...props} className={cn('relative', className)}>
        <CopyButton
          value={rawMarkdown}
          className="absolute top-0 right-0"
          variant="dark"
        />

        {children}
      </code>
    )
  },
})

const Markdown = ({
  className,
  remarkPlugins = [],
  rehypePlugins = [],
  linkTarget = '_blank',
  components,
  children,
  ...props
}: MarkdownProps) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm, ...remarkPlugins]}
    rehypePlugins={[rehypeHighlight, ...rehypePlugins]}
    linkTarget={linkTarget}
    className={cn('prose max-w-none', className)}
    components={{
      ...getDefaultComponents({ rawMarkdown: children }),
      ...components,
    }}
    {...props}
  >
    {children}
  </ReactMarkdown>
)

export default Markdown
