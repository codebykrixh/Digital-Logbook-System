'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Cog,
  AlertTriangle,
  HeartPulse,
  ClipboardList,
  CheckCircle2,
  RefreshCcw,
  Inbox,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { IncidentTrendChart } from '@/components/dashboard/incident-trend-chart';
import { analyticsApi } from '@/services/analytics.service';
import { useAuthStore } from '@/store/auth-store';

const SEVERITY_TONE: Record<string, NonNullable<BadgeProps['variant']>> = {
  LOW: 'success',
  MEDIUM: 'default',
  HIGH: 'warning',
  CRITICAL: 'destructive',
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => analyticsApi.overview(),
    select: (res) => res.data,
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Welcome back{user ? `, ${user.firstName}` : ''} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening across your operations today.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCcw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isError && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
          <div>
            <p className="text-sm font-medium text-destructive">
              Couldn&apos;t load dashboard data
            </p>
            <p className="text-xs text-muted-foreground">
              The API may be unreachable. Check that the backend is running.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      )}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <KpiCard
              icon={Cog}
              label="Active machines"
              value={`${data.kpis.activeMachines}/${data.kpis.totalMachines}`}
              tone="primary"
            />
            <KpiCard
              icon={AlertTriangle}
              label="Open incidents"
              value={String(data.kpis.openIncidents)}
              sub={`${data.kpis.totalIncidents} total`}
              tone={data.kpis.openIncidents > 0 ? 'warning' : 'success'}
            />
            <KpiCard
              icon={HeartPulse}
              label="Avg. machine health"
              value={`${data.kpis.avgMachineHealth}%`}
              tone={data.kpis.avgMachineHealth >= 80 ? 'success' : 'warning'}
            />
            <KpiCard
              icon={ClipboardList}
              label="Shift logs today"
              value={String(data.kpis.shiftLogsToday)}
              tone="primary"
            />
            <KpiCard
              icon={CheckCircle2}
              label="CAPA completion"
              value={`${data.kpis.capaCompletionRate}%`}
              tone={data.kpis.capaCompletionRate >= 70 ? 'success' : 'warning'}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            <div className="rounded-2xl border bg-card p-5 shadow-soft lg:col-span-3">
              <div className="mb-1 flex items-center justify-between">
                <p className="font-display text-sm font-semibold">Incident trend</p>
                <span className="text-xs text-muted-foreground">Last 7 days</span>
              </div>
              <IncidentTrendChart data={data.incidentTrend} />
            </div>

            <div className="rounded-2xl border bg-card p-5 shadow-soft lg:col-span-2">
              <p className="mb-3 font-display text-sm font-semibold">Recent incidents</p>
              {data.recentIncidents.length === 0 ? (
                <EmptyState text="No incidents reported yet. Great news!" />
              ) : (
                <div className="space-y-1">
                  {data.recentIncidents.map((inc) => (
                    <div
                      key={inc.id}
                      className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm hover:bg-accent/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{inc.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {inc.reporter.firstName} {inc.reporter.lastName} · {inc.status}
                        </p>
                      </div>
                      <Badge variant={SEVERITY_TONE[inc.severity]} className="shrink-0">
                        {inc.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <p className="mb-3 font-display text-sm font-semibold">Recent shift logs</p>
            {data.recentShiftLogs.length === 0 ? (
              <EmptyState text="No shift logs yet — they'll show up here once your team starts logging." />
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {data.recentShiftLogs.map((log) => (
                  <div key={log.id} className="rounded-xl border p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{log.plant.name}</p>
                      <Badge variant="secondary" className="text-[10px]">
                        {log.shiftType}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {log.author.firstName} {log.author.lastName} ·{' '}
                      {new Date(log.shiftDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center">
      <Inbox className="h-7 w-7 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
