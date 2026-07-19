'use client';

import * as React from 'react';
import { Search, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { EventFilters as Filters } from '@/types/event';

export function EventFiltersBar({
  filters,
  onChange,
  onCreate,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onCreate: () => void;
}) {
  const [search, setSearch] = React.useState(filters.search ?? '');

  React.useEffect(() => {
    const timeout = setTimeout(() => onChange({ ...filters, search: search || undefined, page: 1 }), 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const hasActiveFilters = Boolean(filters.status || filters.priority || filters.mine || filters.search);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[220px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events…" className="pl-9" />
      </div>

      <Select
        value={filters.status ?? 'ALL'}
        onValueChange={(v) => onChange({ ...filters, status: v === 'ALL' ? undefined : (v as Filters['status']), page: 1 })}
      >
        <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All statuses</SelectItem>
          <SelectItem value="OPEN">Open</SelectItem>
          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
          <SelectItem value="RESOLVED">Resolved</SelectItem>
          <SelectItem value="CLOSED">Closed</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.priority ?? 'ALL'}
        onValueChange={(v) => onChange({ ...filters, priority: v === 'ALL' ? undefined : (v as Filters['priority']), page: 1 })}
      >
        <SelectTrigger className="w-40"><SelectValue placeholder="Priority" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All priorities</SelectItem>
          <SelectItem value="ROUTINE">Routine</SelectItem>
          <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
          <SelectItem value="EMERGENCY">Emergency</SelectItem>
        </SelectContent>
      </Select>

      <label className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground shadow-soft">
        <Switch checked={!!filters.mine} onCheckedChange={(checked) => onChange({ ...filters, mine: checked, page: 1 })} />
        Mine only
      </label>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={() => { setSearch(''); onChange({ page: 1, limit: filters.limit }); }}>
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}

      <Button variant="gradient" size="sm" className="ml-auto" onClick={onCreate}>
        <Plus className="h-3.5 w-3.5" />
        New event
      </Button>
    </div>
  );
}
