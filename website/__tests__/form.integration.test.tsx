import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { z } from 'zod'
import Form, { FORM_ERROR } from '~/components/forms/Form'
import FormInput from '~/components/forms/FormInput'
import FormButton from '~/components/forms/FormButton'

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormResult = { [FORM_ERROR]?: string } | void

function LoginForm({
  onSubmit,
}: {
  onSubmit: (
    values: z.infer<typeof LoginSchema>
  ) => FormResult | Promise<FormResult>
}) {
  return (
    <Form schema={LoginSchema} onSubmit={onSubmit}>
      <FormInput name="email" label="Email" type="email" />
      <FormInput name="password" label="Password" type="password" />
      <FormButton type="submit">Sign In</FormButton>
    </Form>
  )
}

describe('Form Integration', () => {
  it('submits valid form data', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()

    render(<LoginForm onSubmit={handleSubmit} />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('shows validation errors for invalid input', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()

    render(<LoginForm onSubmit={handleSubmit} />)

    // Submit with invalid data
    await user.type(screen.getByLabelText(/email/i), 'invalid-email')
    await user.type(screen.getByLabelText(/password/i), '123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
      expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument()
    })

    expect(handleSubmit).not.toHaveBeenCalled()
  })

  it('shows submit error in alert when onSubmit returns FORM_ERROR', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn().mockResolvedValue({
      [FORM_ERROR]: 'Invalid credentials. Please try again.',
    })

    render(<LoginForm onSubmit={handleSubmit} />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })

  it('disables submit button while submitting', async () => {
    const user = userEvent.setup()
    let resolveSubmit: () => void
    const handleSubmit = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve
        })
    )

    render(<LoginForm onSubmit={handleSubmit} />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(submitButton).toBeDisabled()
    })

    // Resolve the promise to complete submission
    resolveSubmit!()

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })
})
