import { ComponentPropsWithoutRef, forwardRef, PropsWithoutRef } from 'react'
import { useField, UseFieldConfig } from 'react-final-form'
import Input from '../ui/Input'
import Label from '../ui/Label'
import { cn } from '~/lib/utils'

export interface FormInputProps
  extends PropsWithoutRef<JSX.IntrinsicElements['input']> {
  /** Field name. */
  name: string
  /** Field label. */
  label: string
  /** Field type. Doesn't include radio buttons and checkboxes */
  type?: 'text' | 'password' | 'email' | 'number'
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements['div']>
  labelProps?: ComponentPropsWithoutRef<'label'>
  fieldProps?: UseFieldConfig<string>
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    { name, label, className, outerProps, fieldProps, labelProps, ...props },
    ref
  ) => {
    const {
      input,
      meta: { touched, error, submitError, submitting },
    } = useField(name, {
      parse:
        props.type === 'number'
          ? (Number as any)
          : // Converting `""` to `null` ensures empty values will be set to null in the DB
            (v) => (v === '' ? null : v),
      ...fieldProps,
    })

    const normalizedError = Array.isArray(error)
      ? error.join(', ')
      : error || submitError

    return (
      <div {...outerProps} className={cn('space-y-1', className)}>
        <Label htmlFor={name} {...labelProps}>
          {label}
        </Label>
        <Input
          id={name}
          {...input}
          disabled={submitting}
          {...props}
          ref={ref}
        />

        {touched && normalizedError && (
          <div role="alert" className="text-sm text-red-600">
            {normalizedError}
          </div>
        )}
      </div>
    )
  }
)

FormInput.displayName = 'FormInput'

export default FormInput
