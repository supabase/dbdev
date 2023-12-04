import { ComponentPropsWithoutRef, forwardRef } from 'react'
import { cn } from '~/lib/utils'

export interface AProps extends ComponentPropsWithoutRef<'a'> {}

const A = forwardRef<HTMLAnchorElement, AProps>(
  ({ className, children, ...props }) => (
    <a
      className={cn('tracking-tight dark:text-white break-words', className)}
      {...props}
    >
      {children}
    </a>
  )
)

A.displayName = 'A'

export default A
