import { ComponentPropsWithoutRef, forwardRef } from 'react'
import { cn } from '~/lib/utils'

export interface StrongProps extends ComponentPropsWithoutRef<'strong'> {}

const Strong = forwardRef<HTMLElement, StrongProps>(
  ({ className, children, ...props }, ref) => (
    <strong
      className={cn('tracking-tight text-foreground font-semibold', className)}
      {...props}
      ref={ref}
    >
      {children}
    </strong>
  )
)

Strong.displayName = 'Strong'

export default Strong
