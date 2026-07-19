'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { IncidentTrendChart } from '@/components/dashboard/incident-trend-chart';
import { SeverityChart } from '@/components/analytics/severity-chart';
import { MachineHealthTable } from '@/components/analytics/machine-health-table';
import { AuditLogTable } from '@/components/analytics/audit-log-table';
import { analyticsApi } from '@/services/analytics.service';
import { useAuthStore } from '@/store/auth-store';

const AUDIT_ROLES = ['MANAGER', 'ADMIN'];

export default function AnalyticsPage() {
  const user = useAuthStore((s) => s.user);
  const [auditPage, setAuditPage] = React.useState(1);
  const canViewAudit = user ? AUDIT_ROLES.includes(user.role) : false;

  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => analyticsApi.overview(),
    select: (res) => res.data,
  });
  const { data: machineHealth, isLoading: loadingHealth } = useQuery({
    queryKey: ['analytics', 'machine-health'],
    queryFn: () => analyticsApi.machineHealth(),
    select: (res) => res.data,
  });
  const { data: severity, isLoading: loadingSeverity } = useQuery({
    queryKey: ['analytics', 'severity'],
    queryFn: () => analyticsApi.incidentsBySeverity(),
    select: (res) => res.data,
  });
  const { data: auditLog, isLoading: loadingAudit } = useQuery({
    queryKey: ['analytics', 'audit-log', auditPage],
    queryFn: () => analyticsApi.auditLog(auditPage),
    select: (res) => res.data,
    enabled: canViewAudit,
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Analytics &amp; Reports</h1>
        <p className="text-sm text-muted-foreground">Plant-wide trends across machines, incidents, and compliance.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6 shadow-soft">
          <p className="mb-3 font-display text-sm font-semibold">Incident trend (7 days)</p>
          {loadingOverview || !overview ? (
            <Skeleton className="h-56 w-full" />
          ) : (
            <IncidentTrendChart data={overview.incidentTrend} />
          )}
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-soft">
          <p className="mb-3 font-display text-sm font-semibold">Incidents by severity</p>
          {loadingSeverity || !severity ? <Skeleton className="h-56 w-full" /> : <SeverityChart data={severity} />}
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-soft">
        <p className="mb-3 font-display text-sm font-semibold">Machine health</p>
        {loadingHealth || !machineHealth ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : (
          <MachineHealthTable data={machineHealth} />
        )}
      </div>

      {canViewAudit && (
        <div className="rounded-2xl border bg-card p-6 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display text-sm font-semibold">Audit trail</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={auditPage <= 1} onClick={() => setAuditPage((p) => p - 1)}>
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!auditLog || auditLog.length < 25}
                onClick={() => setAuditPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
          {loadingAudit || !auditLog ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <AuditLogTable data={auditLog} />
          )}
        </div>
      )}
    </div>
  );
}
