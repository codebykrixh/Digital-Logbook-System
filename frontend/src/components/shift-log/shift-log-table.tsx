'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, Paperclip, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ShiftLogStatusBadge } from './status-badge';
import type { ShiftLogFilters, ShiftLogListItem } from '@/types/shift-log';

const columnHelper = createColumnHelper<ShiftLogListItem>();

const SHIFT_LABEL: Record<string, string> = {
  MORNING: 'Morning',
  AFTERNOON: 'Afternoon',
  NIGHT: 'Night',
};

interface ShiftLogTableProps {
  data: ShiftLogListItem[];
  isLoading: boolean;
  filters: ShiftLogFilters;
  total: number;
  onFiltersChange: (filters: ShiftLogFilters) => void;
}

export function ShiftLogTable({
  data,
  isLoading,
  filters,
  total,
  onFiltersChange,
}: ShiftLogTableProps) {
  const router = useRouter();

  const sorting: SortingState = filters.sortBy
    ? [{ id: filters.sortBy, desc: filters.sortOrder !== 'asc' }]
    : [{ id: 'shiftDate', desc: true }];

  const columns = React.useMemo(
    () => [
      columnHelper.accessor('code', {
        header: 'Code',
        cell: (info) => (
          <span className="font-mono text-xs text-muted-foreground">
            {info.getValue().slice(0, 10)}
          </span>
        ),
      }),
      columnHelper.accessor('shiftDate', {
        header: 'Shift Date',
        cell: (info) => (
          <div>
            <p className="font-medium">
              {new Date(info.getValue()).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              {SHIFT_LABEL[info.row.original.shiftType]}
            </p>
          </div>
        ),
      }),
      columnHelper.display({
        id: 'author',
        header: 'Operator',
        cell: (info) => {
          const row = info.row.original;
          return (
            <div>
              <p className="font-medium">
                {row.author.firstName} {row.author.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                {row.department?.name ?? row.plant.name}
              </p>
            </div>
          );
        },
      }),
      columnHelper.accessor('equipmentStatus', {
        header: 'Equipment Status',
        cell: (info) => (
          <span className="line-clamp-1 text-sm text-muted-foreground">
            {info.getValue() || '—'}
          </span>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => <ShiftLogStatusBadge status={info.getValue()} />,
      }),
      columnHelper.display({
        id: 'attachments',
        header: '',
        cell: (info) =>
          info.row.original._count.attachments > 0 ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Paperclip className="h-3 w-3" />
              {info.row.original._count.attachments}
            </span>
          ) : null,
      }),
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    manualSorting: true,
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      const first = next[0];
      onFiltersChange({
        ...filters,
        sortBy: (first?.id as ShiftLogFilters['sortBy']) ?? 'shiftDate',
        sortOrder: first?.desc ? 'desc' : 'asc',
      });
    },
    getCoreRowModel: getCoreRowModel(),
  });

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sortable = header.column.getCanSort();
                  const sortDir = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium text-muted-foreground"
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="flex items-center gap-1 disabled:cursor-default"
                          disabled={!sortable}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sortable &&
                            (sortDir === 'asc' ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : sortDir === 'desc' ? (
                              <ArrowDown className="h-3 w-3" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-40" />
                            ))}
                        </button>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b last:border-0">
                  {columns.map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-5 w-full" />
                    </td>
                  ))}
                </tr>
              ))}

            {!isLoading && data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No shift logs match these filters yet.
                </td>
              </tr>
            )}

            {!isLoading &&
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => router.push(`/shift-logbook/${row.original.id}`)}
                  className="cursor-pointer border-b transition-colors last:border-0 hover:bg-accent/40"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {!isLoading && total > 0 && (
        <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
          <span>
            Page {page} of {totalPages} · {total} total
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onFiltersChange({ ...filters, page: page - 1 })}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onFiltersChange({ ...filters, page: page + 1 })}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
