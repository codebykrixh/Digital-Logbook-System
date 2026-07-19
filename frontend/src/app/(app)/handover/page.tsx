'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { HandoverStatusBadge } from '@/components/handover/handover-status-badge';
import { handoverApi } from '@/services/handover.service';
import type { HandoverFilters } from '@/types/handover';

const SHIFT_LABEL: Record<string, string> = { MORNING: 'Morning', AFTERNOON: 'Afternoon', NIGHT: 'Night' };

export default function HandoverPage() {
  const router = useRouter();
  const [filters, setFilters] = React.useState<HandoverFilters>({ page: 1, limit: 20 });

  const { data, isLoading } = useQuery({
    queryKey: ['handovers', filters],
    queryFn: () => handoverApi.list(filters),
  });
  const items = data?.data ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Shift Handover</h1>
          <p className="text-sm text-muted-foreground">Auto-summarized handoffs with checklist and digital signature.</p>
        </div>
        <Button variant="gradient" onClick={() => router.push('/handover/new')}>
          <Plus className="h-4 w-4" />
          New handover
        </Button>
      </div>

      <div className="flex gap-2">
        <label className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground shadow-soft">
          <Switch checked={!!filters.mine} onCheckedChange={(checked) => setFilters({ ...filters, mine: checked, forMe: false, page: 1 })} />
          Mine
        </label>
        <label className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground shadow-soft">
          <Switch checked={!!filters.forMe} onCheckedChange={(checked) => setFilters({ ...filters, forMe: checked, mine: false, page: 1 })} />
          Addressed to me
        </label>
      </div>

      <div className="space-y-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}

        {!isLoading && items.length === 0 && (
          <div className="rounded-2xl border bg-card p-12 text-center text-sm text-muted-foreground shadow-soft">
            No handovers yet.
          </div>
        )}

        {!isLoading &&
          items.map((h) => (
            <button
              key={h.id}
              onClick={() => router.push(`/handover/${h.id}`)}
              className="flex w-full items-center justify-between gap-4 rounded-2xl border bg-card p-4 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card"
            >
              <div>
                <p className="font-medium">
                  {h.fromUser.firstName} {h.fromUser.lastName}
                  <ArrowRight className="mx-2 inline h-3.5 w-3.5 text-muted-foreground" />
                  {h.toUser ? `${h.toUser.firstName} ${h.toUser.lastName}` : 'Unassigned'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {SHIFT_LABEL[h.shiftType]} · {new Date(h.shiftDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <HandoverStatusBadge status={h.status} />
            </button>
          ))}
      </div>
    </div>
  );
}
