import { forwardRef } from 'react'
import { useFormState } from 'react-final-form'
import { cn } from '~/lib/utils'
import Button, { ButtonProps } from '../ui/Button'

export interface FormButtonProps extends ButtonProps {}

const FormButton = forwardRef<HTMLButtonElement, FormButtonProps>(
  ({ children, className, ...props }, ref) => {
    const { submitting } = useFormState()

    return (
      <Button
        disabled={submitting}
        className={cn('mt-4', className)}
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
