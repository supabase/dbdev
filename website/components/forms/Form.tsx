import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle } from 'lucide-react'
import {
  createContext,
  PropsWithChildren,
  PropsWithoutRef,
  useContext,
} from 'react'
import {
  FieldValues,
  FormProvider,
  useForm,
  UseFormReturn,
} from 'react-hook-form'
import { z } from 'zod'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { cn } from '~/lib/utils'

// FORM_ERROR constant for backwards compatibility
export const FORM_ERROR = 'FINAL_FORM/form-error' as const

// Context to share form instance with child components
const FormContext = createContext<UseFormReturn<any> | null>(null)

export function useFormInstance<T extends FieldValues = FieldValues>() {
  const form = useContext(FormContext)
  if (!form) {
    throw new Error('useFormInstance must be used within a Form')
  }
  return form as UseFormReturn<T>
}

export interface FormProps<S extends z.ZodType<any, any>> extends Omit<
  PropsWithoutRef<JSX.IntrinsicElements['form']>,
  'onSubmit'
> {
  /** Zod schema for validation */
  schema?: S
  /** Called on form submission. Return { [FORM_ERROR]: message } to show error */
  onSubmit: (
    values: z.infer<S>
  ) => void | Promise<void | { [FORM_ERROR]?: string }>
  /** Initial form values */
  initialValues?: Partial<z.infer<S>>
}

function Form<S extends z.ZodType<any, any>>({
  children,
  schema,
  initialValues,
  onSubmit,
  className,
  ...props
}: PropsWithChildren<FormProps<S>>) {
  const form = useForm<z.infer<S>>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: initialValues as any,
  })

  const handleSubmit = async (values: z.infer<S>) => {
    const result = await onSubmit(values)
    if (result && FORM_ERROR in result && result[FORM_ERROR]) {
      form.setError('root', { message: result[FORM_ERROR] })
    }
  }

  const rootError = form.formState.errors.root?.message

  return (
    <FormContext.Provider value={form}>
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className={cn('flex flex-col gap-2', className)}
          noValidate
          {...props}
        >
          {rootError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{rootError}</AlertDescription>
            </Alert>
          )}

          {/* Form fields supplied as children are rendered here */}
          {children}
        </form>
      </FormProvider>
    </FormContext.Provider>
  )
}

export default Form
