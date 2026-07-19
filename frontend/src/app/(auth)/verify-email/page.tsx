'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authApi } from '@/services/auth.service';
import { ApiClientError } from '@/lib/api';

type Status = 'verifying' | 'success' | 'error';

function VerifyEmail() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<Status>('verifying');
  const [message, setMessage] = useState('');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // guard against double-run in strict mode
    ran.current = true;

    if (!token) {
      setStatus('error');
      setMessage('This verification link is missing a token.');
      return;
    }
    authApi
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setMessage(
          err instanceof ApiClientError
            ? err.message
            : 'We could not verify your email.'
        );
      });
  }, [token]);

  if (status === 'verifying') {
    return (
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold tracking-tight">
          Verifying your email…
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This will only take a moment.
        </p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-success/10">
          <CheckCircle2 className="h-7 w-7 text-success" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold tracking-tight">
          Email verified
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account is now fully activated. Welcome to DigiLog!
        </p>
        <Button asChild variant="gradient" className="mt-8 w-full">
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10">
        <ShieldX className="h-7 w-7 text-destructive" />
      </div>
      <h1 className="mt-6 font-display text-2xl font-bold tracking-tight">
        Verification failed
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      <Button asChild variant="outline" className="mt-8 w-full">
        <Link href="/login">Back to sign in</Link>
      </Button>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <VerifyEmail />
    </Suspense>
  );
}
