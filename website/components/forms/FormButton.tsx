import { forwardRef } from 'react'
import { useFormContext } from 'react-hook-form'
import { cn } from '~/lib/utils'
import { Button, ButtonProps } from '~/components/ui/button'

export interface FormButtonProps extends ButtonProps {}

const FormButton = forwardRef<HTMLButtonElement, FormButtonProps>(
  ({ children, className, disabled, ...props }, ref) => {
    const {
      formState: { isSubmitting },
    } = useFormContext()

    return (
      <Button
        disabled={isSubmitting || disabled}
        className={cn(
          'mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 transition dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white',
          className
        )}
        {...props}
        ref={ref}
      >
        {children}
      </Button>
    )
  }
)

FormButton.displayName = 'FormButton'

export default FormButton
