'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { LayoutList, GanttChartSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ShiftLogFiltersBar } from '@/components/shift-log/shift-log-filters';
import { ShiftLogTable } from '@/components/shift-log/shift-log-table';
import { ShiftLogTimeline } from '@/components/shift-log/shift-log-timeline';
import { shiftLogApi } from '@/services/shift-log.service';
import { ApiClientError } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import type { ShiftLogFilters } from '@/types/shift-log';

type ViewMode = 'table' | 'timeline';

export default function ShiftLogbookPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [view, setView] = React.useState<ViewMode>('table');
  const [filters, setFilters] = React.useState<ShiftLogFilters>({ page: 1, limit: 20 });
  const [exporting, setExporting] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['shift-logs', filters],
    queryFn: () => shiftLogApi.list(filters),
  });

  const items = data?.data ?? [];
  const total = (data?.meta?.total as number) ?? 0;

  const handleExport = async () => {
    setExporting(true);
    try {
      await shiftLogApi.exportCsv(filters, accessToken);
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Shift Logbook
          </h1>
          <p className="text-sm text-muted-foreground">
            Structured shift entries with drafts, autosave, and full history.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border bg-card p-1 shadow-soft">
          <ViewToggleButton
            active={view === 'table'}
            icon={LayoutList}
            label="Table"
            onClick={() => setView('table')}
          />
          <ViewToggleButton
            active={view === 'timeline'}
            icon={GanttChartSquare}
            label="Timeline"
            onClick={() => setView('timeline')}
          />
        </div>
      </div>

      <ShiftLogFiltersBar
        filters={filters}
        onChange={setFilters}
        onExport={handleExport}
        onCreate={() => router.push('/shift-logbook/new')}
        exporting={exporting}
      />

      {view === 'table' ? (
        <ShiftLogTable
          data={items}
          isLoading={isLoading}
          filters={filters}
          total={total}
          onFiltersChange={setFilters}
        />
      ) : (
        <ShiftLogTimeline data={items} isLoading={isLoading} />
      )}
    </div>
  );
}

function ViewToggleButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(!active && 'text-muted-foreground', active && 'bg-accent')}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Button>
  );
}
