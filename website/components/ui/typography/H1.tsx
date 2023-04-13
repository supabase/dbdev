import { ComponentPropsWithoutRef, forwardRef } from 'react'
import { cn } from '~/lib/utils'

export interface H1Props extends ComponentPropsWithoutRef<'h1'> {}

const H1 = forwardRef<HTMLHeadingElement, H1Props>(
  ({ className, children, ...props }, ref) => (
    <h1
      className={cn(
        'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl dark:text-white',
        className
      )}
      {...props}
      ref={ref}
    >
      {children}
    </h1>
  )
)

H1.displayName = 'H1'

export default H1
