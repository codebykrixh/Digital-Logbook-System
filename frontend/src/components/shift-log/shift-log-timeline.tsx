'use client';

import Link from 'next/link';
import { Paperclip } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ShiftLogStatusBadge } from './status-badge';
import type { ShiftLogListItem } from '@/types/shift-log';

const SHIFT_LABEL: Record<string, string> = {
  MORNING: 'Morning',
  AFTERNOON: 'Afternoon',
  NIGHT: 'Night',
};

function groupByDate(items: ShiftLogListItem[]) {
  const groups = new Map<string, ShiftLogListItem[]>();
  for (const item of items) {
    const key = item.shiftDate.slice(0, 10);
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }
  return Array.from(groups.entries());
}

export function ShiftLogTimeline({
  data,
  isLoading,
}: {
  data: ShiftLogListItem[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-12 text-center text-sm text-muted-foreground shadow-soft">
        No shift logs match these filters yet.
      </div>
    );
  }

  const groups = groupByDate(data);

  return (
    <div className="relative space-y-8 pl-6">
      <div className="absolute bottom-0 left-[7px] top-2 w-px bg-border" aria-hidden />
      {groups.map(([date, items]) => (
        <div key={date} className="relative">
          <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background" />
          <p className="mb-3 font-display text-sm font-semibold">
            {new Date(date).toLocaleDateString('en-IN', {
              weekday: 'long',
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </p>
          <div className="space-y-3">
            {items.map((log) => (
              <Link
                key={log.id}
                href={`/shift-logbook/${log.id}`}
                className="block rounded-2xl border bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xs font-semibold text-white">
                      {log.author.firstName[0]}
                      {log.author.lastName[0]}
                    </span>
                    <div>
                      <p className="text-sm font-medium">
                        {log.author.firstName} {log.author.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {SHIFT_LABEL[log.shiftType]} shift · {log.department?.name ?? log.plant.name}
                      </p>
                    </div>
                  </div>
                  <ShiftLogStatusBadge status={log.status} />
                </div>
                {log.equipmentStatus && (
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                    {log.equipmentStatus}
                  </p>
                )}
                {log._count.attachments > 0 && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <Paperclip className="h-3 w-3" />
                    {log._count.attachments} attachment{log._count.attachments > 1 ? 's' : ''}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
