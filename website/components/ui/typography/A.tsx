import { ComponentPropsWithoutRef, forwardRef } from 'react'
import { cn } from '~/lib/utils'

export interface AProps extends ComponentPropsWithoutRef<'a'> {}

const A = forwardRef<HTMLAnchorElement, AProps>(
  ({ className, children, target = '_blank', ...props }) => (
    <a
      className={cn(
        'tracking-tight text-primary break-words underline-offset-4 hover:underline',
        className
      )}
      target={target}
      {...props}
    >
      {children}
    </a>
  )
)

A.displayName = 'A'

export default A
