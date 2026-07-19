'use client';

import * as React from 'react';
import { Search, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { IncidentFilters as Filters } from '@/types/incident';

export function IncidentFiltersBar({
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

  const hasActiveFilters = Boolean(filters.status || filters.severity || filters.mine || filters.assignedToMe || filters.search);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[220px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search code, title, description…" className="pl-9" />
      </div>

      <Select
        value={filters.status ?? 'ALL'}
        onValueChange={(v) => onChange({ ...filters, status: v === 'ALL' ? undefined : (v as Filters['status']), page: 1 })}
      >
        <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All statuses</SelectItem>
          <SelectItem value="OPEN">Open</SelectItem>
          <SelectItem value="ASSIGNED">Assigned</SelectItem>
          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
          <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
          <SelectItem value="RESOLVED">Resolved</SelectItem>
          <SelectItem value="CLOSED">Closed</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.severity ?? 'ALL'}
        onValueChange={(v) => onChange({ ...filters, severity: v === 'ALL' ? undefined : (v as Filters['severity']), page: 1 })}
      >
        <SelectTrigger className="w-36"><SelectValue placeholder="Severity" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All severities</SelectItem>
          <SelectItem value="LOW">Low</SelectItem>
          <SelectItem value="MEDIUM">Medium</SelectItem>
          <SelectItem value="HIGH">High</SelectItem>
          <SelectItem value="CRITICAL">Critical</SelectItem>
        </SelectContent>
      </Select>

      <label className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground shadow-soft">
        <Switch checked={!!filters.assignedToMe} onCheckedChange={(checked) => onChange({ ...filters, assignedToMe: checked, page: 1 })} />
        Assigned to me
      </label>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={() => { setSearch(''); onChange({ page: 1, limit: filters.limit }); }}>
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}

      <Button variant="gradient" size="sm" className="ml-auto" onClick={onCreate}>
        <Plus className="h-3.5 w-3.5" />
        Report incident
      </Button>
    </div>
  );
}
