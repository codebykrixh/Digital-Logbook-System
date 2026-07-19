'use client';

import { cn } from '@/lib/utils';

function score(password: string): number {
  let s = 0;
  if (password.length >= 8) s++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) s++;
  if (/[0-9]/.test(password)) s++;
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) s++;
  return s; // 0..4
}

const LABELS = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
const COLORS = [
  'bg-muted',
  'bg-destructive',
  'bg-warning',
  'bg-yellow-400',
  'bg-success',
];

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const s = score(password);
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              i < s ? COLORS[s] : 'bg-muted'
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Password strength:{' '}
        <span className="font-medium text-foreground">{LABELS[s]}</span>
      </p>
    </div>
  );
}
