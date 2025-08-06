import NextLink from 'next/link'
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react'
import { cn } from '~/lib/utils'

export interface LinkProps extends ComponentPropsWithoutRef<typeof NextLink> {}

const Link = forwardRef<ElementRef<typeof NextLink>, LinkProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <NextLink
        ref={ref}
        className={cn(
          'underline hover:decoration-2 transition duration-200',
          className
        )}
        {...props}
      >
        {children}
      </NextLink>
    )
  }
)

Link.displayName = 'Link'

export default Link
