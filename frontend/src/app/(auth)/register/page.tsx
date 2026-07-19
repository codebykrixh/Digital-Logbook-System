'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, TextField, PasswordField } from '@/components/auth/field';
import { PasswordStrength } from '@/components/auth/password-strength';
import { registerSchema, type RegisterValues } from '@/lib/validations/auth';
import { authApi } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth-store';
import { ApiClientError } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (values: RegisterValues) => {
    try {
      const { data } = await authApi.register({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
      });
      setAuth(data.user, data.accessToken);
      toast.success('Account created! Check your email to verify.');
      router.push('/dashboard');
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : 'Something went wrong';
      toast.error(message);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Create your account
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Start your 30-day free trial. No credit card required.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="First name"
            htmlFor="firstName"
            error={errors.firstName?.message}
          >
            <TextField
              id="firstName"
              autoComplete="given-name"
              placeholder="Aarav"
              aria-invalid={!!errors.firstName}
              {...register('firstName')}
            />
          </Field>
          <Field
            label="Last name"
            htmlFor="lastName"
            error={errors.lastName?.message}
          >
            <TextField
              id="lastName"
              autoComplete="family-name"
              placeholder="Nair"
              aria-invalid={!!errors.lastName}
              {...register('lastName')}
            />
          </Field>
        </div>

        <Field label="Work email" htmlFor="email" error={errors.email?.message}>
          <TextField
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            aria-invalid={!!errors.email}
            {...register('email')}
          />
        </Field>

        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <PasswordField
            id="password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            aria-invalid={!!errors.password}
            {...register('password')}
          />
          <PasswordStrength password={password} />
        </Field>

        <Field
          label="Confirm password"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
        >
          <PasswordField
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            aria-invalid={!!errors.confirmPassword}
            {...register('confirmPassword')}
          />
        </Field>

        <Button
          type="submit"
          variant="gradient"
          className="w-full"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Create account
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
