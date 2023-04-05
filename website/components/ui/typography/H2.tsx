import { ComponentPropsWithoutRef, forwardRef } from 'react'
import { cn } from '~/lib/utils'

export interface H2Props extends ComponentPropsWithoutRef<'h2'> {}

const H2 = forwardRef<HTMLHeadingElement, H2Props>(
  ({ className, children, ...props }, ref) => (
    <h2
      className={cn(
        'mt-10 scroll-m-20 border-b border-b-slate-200 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0 dark:border-b-slate-700',
        className
      )}
      {...props}
      ref={ref}
    >
      {children}
    </h2>
  )
)

H2.displayName = 'H2'

export default H2
