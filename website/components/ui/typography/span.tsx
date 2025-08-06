import { ComponentPropsWithoutRef, forwardRef } from 'react'
import { cn } from '~/lib/utils'

export interface SpanProps extends ComponentPropsWithoutRef<'span'> {}

const Span = forwardRef<HTMLHeadingElement, SpanProps>(
  ({ className, children, ...props }, ref) => (
    <span
      className={cn('tracking-tight dark:text-white', className)}
      {...props}
      ref={ref}
    >
      {children}
    </span>
  )
)

Span.displayName = 'Span'

export default Span
