import { ComponentPropsWithoutRef, PropsWithoutRef } from 'react'
import { useFormContext } from 'react-hook-form'
import { Input } from '~/components/ui/input'
import { Label } from '../ui/label'
import { cn } from '~/lib/utils'

export interface FormInputProps extends PropsWithoutRef<
  JSX.IntrinsicElements['input']
> {
  /** Field name. */
  name: string
  /** Field label. */
  label: string
  /** Field type. Doesn't include radio buttons and checkboxes */
  type?: 'text' | 'password' | 'email' | 'number'
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements['div']>
  labelProps?: ComponentPropsWithoutRef<'label'>
}

function FormInput({
  name,
  label,
  className,
  outerProps,
  labelProps,
  type,
  ...props
}: FormInputProps) {
  const {
    register,
    formState: { errors, isSubmitting, submitCount },
  } = useFormContext()

  const fieldError = errors[name]
  const errorMessage = fieldError?.message as string | undefined

  // Get the register props including the ref
  const { ref, ...registerProps } = register(name, {
    valueAsNumber: type === 'number',
  })

  // Show errors after first submit attempt
  const showError = submitCount > 0 && !!errorMessage

  return (
    <div {...outerProps} className={cn('space-y-1', className)}>
      <Label htmlFor={name} {...labelProps}>
        {label}
      </Label>
      <Input
        id={name}
        type={type}
        disabled={isSubmitting || props.disabled}
        {...props}
        {...registerProps}
        ref={ref}
      />

      {showError && (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  )
}

FormInput.displayName = 'FormInput'

export default FormInput
