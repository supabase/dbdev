import { ComponentPropsWithoutRef, forwardRef } from 'react'
import { cn } from '~/lib/utils'

export interface PProps extends ComponentPropsWithoutRef<'p'> {}

const P = forwardRef<HTMLHeadingElement, PProps>(
  ({ className, children, ...props }, ref) => (
    <p
      className={cn('tracking-tight dark:text-white', className)}
      {...props}
      ref={ref}
    >
      {children}
    </p>
  )
)

P.displayName = 'P'

export default P
