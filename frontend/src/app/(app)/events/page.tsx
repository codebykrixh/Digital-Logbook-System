'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { EventFiltersBar } from '@/components/event/event-filters';
import { EventTable } from '@/components/event/event-table';
import { eventApi } from '@/services/event.service';
import type { EventFilters } from '@/types/event';

export default function EventsPage() {
  const router = useRouter();
  const [filters, setFilters] = React.useState<EventFilters>({ page: 1, limit: 20 });

  const { data, isLoading } = useQuery({
    queryKey: ['events', filters],
    queryFn: () => eventApi.list(filters),
  });

  const items = data?.data ?? [];
  const total = (data?.meta?.total as number) ?? 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Operational Events</h1>
        <p className="text-sm text-muted-foreground">
          Routine, maintenance, and emergency events across the plant — with comment threads and escalation to incidents.
        </p>
      </div>

      <EventFiltersBar filters={filters} onChange={setFilters} onCreate={() => router.push('/events/new')} />

      <EventTable data={items} isLoading={isLoading} filters={filters} total={total} onFiltersChange={setFilters} />
    </div>
  );
}
