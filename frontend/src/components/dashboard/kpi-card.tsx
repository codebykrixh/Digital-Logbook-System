import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  tone?: 'primary' | 'success' | 'warning' | 'destructive';
}

const TONES: Record<NonNullable<KpiCardProps['tone']>, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/15 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
};

export function KpiCard({ icon: Icon, label, value, sub, tone = 'primary' }: KpiCardProps) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft">
      <div className={cn('inline-flex rounded-xl p-2.5', TONES[tone])}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 font-display text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground/70">{sub}</p>}
    </div>
  );
}
