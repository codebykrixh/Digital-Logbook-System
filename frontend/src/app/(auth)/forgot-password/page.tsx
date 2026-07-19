'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ArrowLeft, MailCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, TextField } from '@/components/auth/field';
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from '@/lib/validations/auth';
import { authApi } from '@/services/auth.service';
import { ApiClientError } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [sentTo, setSentTo] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    try {
      await authApi.forgotPassword(values.email);
      setSentTo(values.email);
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : 'Something went wrong';
      toast.error(message);
    }
  };

  if (sentTo) {
    return (
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-success/10">
          <MailCheck className="h-7 w-7 text-success" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold tracking-tight">
          Check your inbox
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          If an account exists for{' '}
          <span className="font-medium text-foreground">{sentTo}</span>, we&apos;ve
          sent a link to reset your password. It expires in 1 hour.
        </p>
        <Button asChild variant="outline" className="mt-8 w-full">
          <Link href="/login">
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Forgot password?
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
            'Send reset link'
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
