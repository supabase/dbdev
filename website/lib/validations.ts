import { z } from 'zod'

export const email = z
  .string()
  .email()
  .transform((str) => str.toLowerCase().trim())

export const password = z.string().min(8).max(255)

export const handle = z.string().min(3).max(15)

export const displayName = z.string().max(255)

export const SignUpSchema = z.object({
  displayName: displayName.nullable(),
  handle,
  email,
  password,
})

export const UpdateProfileSchema = z.object({
  displayName,
  handle,
  bio: z.string().max(255),
})

export const SignInSchema = z.object({
  email,
  password: z.string().min(1),
})

export const ForgotPasswordSchema = z.object({
  email,
})

export const ResetPasswordSchema = z
  .object({
    password: password,
    passwordConfirmation: password,
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords don't match",
    path: ['passwordConfirmation'], // set the path of the error
  })

export const NewOrgSchema = z.object({
  handle,
  displayName: displayName.nullable(),
})

export const NewTokenSchema = z.object({
  tokenName: z.string().max(64),
})
