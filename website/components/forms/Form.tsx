import { PropsWithChildren, PropsWithoutRef } from 'react'
import {
  Form as FinalForm,
  FormProps as FinalFormProps,
} from 'react-final-form'
import { z } from 'zod'
import { cn } from '~/lib/utils'
import { validateZodSchema } from '~/lib/zod-form-validator-utils'
export { FORM_ERROR } from 'final-form'

export interface FormProps<S extends z.ZodType<any, any>> extends Omit<
  PropsWithoutRef<JSX.IntrinsicElements['form']>,
  'onSubmit'
> {
  /** All your form fields */
  schema?: S
  onSubmit: FinalFormProps<z.infer<S>>['onSubmit']
  initialValues?: FinalFormProps<z.infer<S>>['initialValues']
}

function Form<S extends z.ZodType<any, any>>({
  children,
  schema,
  initialValues,
  onSubmit,
  className,
  ...props
}: PropsWithChildren<FormProps<S>>) {
  return (
    <FinalForm
      initialValues={initialValues}
      validate={validateZodSchema(schema)}
      onSubmit={onSubmit}
      render={({ handleSubmit, submitError }) => (
        <form
          onSubmit={handleSubmit}
          className={cn('flex flex-col gap-2', className)}
          {...props}
        >
          {submitError && (
            <div role="alert" className="text-sm text-red-600">
              {submitError}
            </div>
          )}

          {/* Form fields supplied as children are rendered here */}
          {children}
        </form>
      )}
    />
  )
}

export default Form
