import { ComponentPropsWithoutRef, forwardRef } from 'react'
import { cn } from '~/lib/utils'

export interface CodeProps extends ComponentPropsWithoutRef<'code'> {}

const Code = forwardRef<HTMLHeadingElement, CodeProps>(
  ({ className, children, ...props }, ref) => (
    <code
      className={cn('relative tracking-tight dark:text-white', className)}
      {...props}
      ref={ref}
    >
      {children}
    </code>
  )
)

Code.displayName = 'Code'

export default Code
