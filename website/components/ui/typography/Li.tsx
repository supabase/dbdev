import { ComponentPropsWithoutRef, forwardRef } from 'react'
import { cn } from '~/lib/utils'

export interface LiProps extends ComponentPropsWithoutRef<'li'> {}

const Li = forwardRef<HTMLLIElement, LiProps>(
  ({ className, children, ...props }) => (
    <li className={cn('tracking-tight dark:text-white', className)} {...props}>
      {children}
    </li>
  )
)

Li.displayName = 'Li'

export default Li
