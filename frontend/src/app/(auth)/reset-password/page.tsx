'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ArrowLeft, ShieldX } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, PasswordField } from '@/components/auth/field';
import { PasswordStrength } from '@/components/auth/password-strength';
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from '@/lib/validations/auth';
import { authApi } from '@/services/auth.service';
import { ApiClientError } from '@/lib/api';

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = watch('password');

  const onSubmit = async (values: ResetPasswordValues) => {
    if (!token) return;
    try {
      await authApi.resetPassword(token, values.password);
      toast.success('Password updated. Please sign in.');
      router.push('/login');
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : 'Something went wrong';
      toast.error(message);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10">
          <ShieldX className="h-7 w-7 text-destructive" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold tracking-tight">
          Invalid reset link
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This password reset link is missing or malformed. Please request a new
          one.
        </p>
        <Button asChild variant="gradient" className="mt-8 w-full">
          <Link href="/forgot-password">Request a new link</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Set a new password
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Choose a strong password you haven&apos;t used before.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field
          label="New password"
          htmlFor="password"
          error={errors.password?.message}
        >
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
            'Update password'
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <ResetForm />
    </Suspense>
  );
}
