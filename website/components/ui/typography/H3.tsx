import { ComponentPropsWithoutRef, forwardRef } from 'react'
import { cn } from '~/lib/utils'

export interface H3Props extends ComponentPropsWithoutRef<'h1'> {}

const H3 = forwardRef<HTMLHeadingElement, H3Props>(
  ({ className, children, ...props }, ref) => (
    <h3
      className={cn(
        'scroll-m-20 text-1xl font-semibold tracking-tight transition-colors first:mt-0 dark:border-b-slate-700 dark:text-white',
        className
      )}
      {...props}
      ref={ref}
    >
      {children}
    </h3>
  )
)

H3.displayName = 'H3'

export default H3
