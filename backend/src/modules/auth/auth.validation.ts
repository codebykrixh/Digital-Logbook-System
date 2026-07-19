import { z } from 'zod';

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters')
  .regex(/[a-z]/, 'Must include a lowercase letter')
  .regex(/[A-Z]/, 'Must include an uppercase letter')
  .regex(/[0-9]/, 'Must include a number');

export const registerSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required').max(60),
    lastName: z.string().min(1, 'Last name is required').max(60),
    email: z.string().email('Enter a valid email').toLowerCase(),
    password,
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Enter a valid email').toLowerCase(),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Enter a valid email').toLowerCase(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(10, 'Invalid reset token'),
    password,
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(10, 'Invalid verification token'),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
