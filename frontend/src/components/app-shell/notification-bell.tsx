'use client';

import * as React from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckCheck, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { notificationsApi } from '@/services/notifications.service';
import { cn } from '@/lib/utils';
import type { AppNotification } from '@/types/notification';

const TYPE_DOT: Record<AppNotification['type'], string> = {
  INFO: 'bg-primary',
  WARNING: 'bg-warning',
  INCIDENT: 'bg-destructive',
  MENTION: 'bg-violet-500',
  HANDOVER: 'bg-cyan-500',
  SYSTEM: 'bg-muted-foreground',
};

export function NotificationBell() {
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const { data: unread } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationsApi.unreadCount(),
    refetchInterval: 45_000,
    select: (res) => res.data.count,
  });

  const { data: list, isLoading } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => notificationsApi.list(),
    enabled: open,
    select: (res) => res.data.items,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const count = unread ?? 0;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-[1.15rem] w-[1.15rem]" />
          {count > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3.5 py-2.5">
          <p className="text-sm font-semibold">Notifications</p>
          {count > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {isLoading && (
            <div className="space-y-2 p-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          )}

          {!isLoading && (!list || list.length === 0) && (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <Inbox className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-medium">You&apos;re all caught up</p>
              <p className="text-xs text-muted-foreground">
                New notifications will show up here.
              </p>
            </div>
          )}

          {list?.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.isRead && markRead.mutate(n.id)}
              className={cn(
                'flex w-full items-start gap-3 border-b px-3.5 py-3 text-left transition-colors last:border-0 hover:bg-accent/60',
                !n.isRead && 'bg-primary/5'
              )}
            >
              <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', TYPE_DOT[n.type])} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{n.title}</p>
                {n.body && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {n.body}
                  </p>
                )}
                <p className="mt-1 text-[11px] text-muted-foreground/70">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </div>
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
