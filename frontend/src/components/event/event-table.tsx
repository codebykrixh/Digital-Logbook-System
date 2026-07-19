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
import { ArrowDown, ArrowUp, ArrowUpDown, MessageSquare, Paperclip, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { EventPriorityBadge, EventStatusBadge } from './event-badges';
import type { EventFilters, EventListItem } from '@/types/event';

const columnHelper = createColumnHelper<EventListItem>();

interface EventTableProps {
  data: EventListItem[];
  isLoading: boolean;
  filters: EventFilters;
  total: number;
  onFiltersChange: (filters: EventFilters) => void;
}

export function EventTable({ data, isLoading, filters, total, onFiltersChange }: EventTableProps) {
  const router = useRouter();

  const sorting: SortingState = filters.sortBy
    ? [{ id: filters.sortBy, desc: filters.sortOrder !== 'asc' }]
    : [{ id: 'occurredAt', desc: true }];

  const columns = React.useMemo(
    () => [
      columnHelper.accessor('occurredAt', {
        header: 'Occurred',
        cell: (info) => (
          <span className="text-sm">
            {new Date(info.getValue()).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        ),
      }),
      columnHelper.accessor('title', {
        header: 'Title',
        cell: (info) => (
          <div>
            <p className="line-clamp-1 font-medium">{info.getValue()}</p>
            <p className="text-xs text-muted-foreground">{info.row.original.machine?.name ?? '—'}</p>
          </div>
        ),
      }),
      columnHelper.display({
        id: 'creator',
        header: 'Reported by',
        cell: (info) => {
          const c = info.row.original.creator;
          return <span className="text-sm">{c.firstName} {c.lastName}</span>;
        },
      }),
      columnHelper.accessor('priority', {
        header: 'Priority',
        cell: (info) => <EventPriorityBadge priority={info.getValue()} />,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => <EventStatusBadge status={info.getValue()} />,
      }),
      columnHelper.display({
        id: 'meta',
        header: '',
        cell: (info) => (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {info.row.original._count.comments > 0 && (
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> {info.row.original._count.comments}
              </span>
            )}
            {info.row.original._count.attachments > 0 && (
              <span className="flex items-center gap-1">
                <Paperclip className="h-3 w-3" /> {info.row.original._count.attachments}
              </span>
            )}
          </div>
        ),
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
        sortBy: (first?.id as EventFilters['sortBy']) ?? 'occurredAt',
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
                    <th key={header.id} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
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
                  No events match these filters yet.
                </td>
              </tr>
            )}

            {!isLoading &&
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => router.push(`/events/${row.original.id}`)}
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
          <span>Page {page} of {totalPages} · {total} total</span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onFiltersChange({ ...filters, page: page - 1 })}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onFiltersChange({ ...filters, page: page + 1 })}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
