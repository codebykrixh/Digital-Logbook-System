'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { IncidentFiltersBar } from '@/components/incident/incident-filters';
import { IncidentTable } from '@/components/incident/incident-table';
import { incidentApi } from '@/services/incident.service';
import type { IncidentFilters } from '@/types/incident';

export default function IncidentsPage() {
  const router = useRouter();
  const [filters, setFilters] = React.useState<IncidentFilters>({ page: 1, limit: 20 });

  const { data, isLoading } = useQuery({
    queryKey: ['incidents', filters],
    queryFn: () => incidentApi.list(filters),
  });

  const items = data?.data ?? [];
  const total = (data?.meta?.total as number) ?? 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Incident Management</h1>
        <p className="text-sm text-muted-foreground">
          Report, assign, and resolve incidents with root-cause analysis and corrective actions.
        </p>
      </div>

      <IncidentFiltersBar filters={filters} onChange={setFilters} onCreate={() => router.push('/incidents/new')} />

      <IncidentTable data={items} isLoading={isLoading} filters={filters} total={total} onFiltersChange={setFilters} />
    </div>
  );
}
