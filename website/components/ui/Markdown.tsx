import { ComponentPropsWithoutRef } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { cn } from '~/lib/utils'

const Markdown = ({
  className,
  remarkPlugins = [],
  rehypePlugins = [],
  linkTarget = '_blank',
  children,
  ...props
}: ComponentPropsWithoutRef<typeof ReactMarkdown>) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm, ...remarkPlugins]}
    rehypePlugins={[rehypeHighlight, ...rehypePlugins]}
    linkTarget={linkTarget}
    className={cn('prose max-w-none', className)}
    {...props}
  >
    {children}
  </ReactMarkdown>
)

export default Markdown
