'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AuditLogTable } from '@/components/analytics/audit-log-table';
import { analyticsApi } from '@/services/analytics.service';

/**
 * Peer oversight view: every action any admin has taken, visible to every
 * other admin/manager — so a compromised or rogue admin account can't act
 * without another set of eyes seeing it here (in addition to the real-time
 * notification other admins get when a sensitive action happens).
 */
export function AdminActivityTab() {
  const [page, setPage] = React.useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'activity', page],
    queryFn: () => analyticsApi.adminActivity(page),
    select: (res) => res.data,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <p className="text-muted-foreground">
          Every action taken by any admin account — visible here to all admins and managers. Sensitive
          changes (role grants, deactivations touching another admin) also trigger an immediate
          notification to every other admin.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : (
        <div className="rounded-2xl border bg-card p-6 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display text-sm font-semibold">Admin actions</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
              <Button variant="outline" size="sm" disabled={!data || data.length < 25} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
          <AuditLogTable data={data ?? []} />
        </div>
      )}
    </div>
  );
}
