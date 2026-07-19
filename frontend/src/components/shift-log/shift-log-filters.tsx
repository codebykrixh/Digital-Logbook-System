'use client';

import * as React from 'react';
import { Search, Download, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ShiftLogFilters as Filters } from '@/types/shift-log';

interface ShiftLogFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onExport: () => void;
  onCreate: () => void;
  exporting?: boolean;
}

export function ShiftLogFiltersBar({
  filters,
  onChange,
  onExport,
  onCreate,
  exporting,
}: ShiftLogFiltersProps) {
  const [search, setSearch] = React.useState(filters.search ?? '');

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange({ ...filters, search: search || undefined, page: 1 });
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const hasActiveFilters = Boolean(
    filters.status || filters.shiftType || filters.mine || filters.search
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes, equipment, code…"
            className="pl-9"
          />
        </div>

        <Select
          value={filters.status ?? 'ALL'}
          onValueChange={(v) =>
            onChange({ ...filters, status: v === 'ALL' ? undefined : (v as Filters['status']), page: 1 })
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="SUBMITTED">Submitted</SelectItem>
            <SelectItem value="SIGNED">Signed</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.shiftType ?? 'ALL'}
          onValueChange={(v) =>
            onChange({ ...filters, shiftType: v === 'ALL' ? undefined : (v as Filters['shiftType']), page: 1 })
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Shift" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All shifts</SelectItem>
            <SelectItem value="MORNING">Morning</SelectItem>
            <SelectItem value="AFTERNOON">Afternoon</SelectItem>
            <SelectItem value="NIGHT">Night</SelectItem>
          </SelectContent>
        </Select>

        <label className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground shadow-soft">
          <Switch
            checked={!!filters.mine}
            onCheckedChange={(checked) => onChange({ ...filters, mine: checked, page: 1 })}
          />
          Mine only
        </label>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch('');
              onChange({ page: 1, limit: filters.limit });
            }}
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onExport} disabled={exporting}>
            <Download className="h-3.5 w-3.5" />
            {exporting ? 'Exporting…' : 'Export CSV'}
          </Button>
          <Button variant="gradient" size="sm" onClick={onCreate}>
            <Plus className="h-3.5 w-3.5" />
            New shift log
          </Button>
        </div>
      </div>
    </div>
  );
}
