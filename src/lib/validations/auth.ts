import { z } from 'zod'
import { differenceInYears } from 'date-fns'
import { MIN_AGE } from '@/lib/constants'

export const emailSchema = z.string().email('Please enter a valid email address')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be less than 72 characters')

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export type LoginInput = z.infer<typeof loginSchema>

export const signupSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    dateOfBirth: z.date({
      required_error: 'Please enter your date of birth',
    }),
    ageConfirmation: z.boolean().refine((val) => val === true, {
      message: 'You must confirm you are 18 or older',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      const age = differenceInYears(new Date(), data.dateOfBirth)
      return age >= MIN_AGE
    },
    {
      message: `You must be at least ${MIN_AGE} years old to use this app`,
      path: ['dateOfBirth'],
    }
  )

export type SignupInput = z.infer<typeof signupSchema>
