'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, Trash2, TrendingUp, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { AttachmentUploader } from '@/components/shared/attachment-uploader';
import { CommentThread } from '@/components/shared/comment-thread';
import { EventForm } from '@/components/event/event-form';
import { EventPriorityBadge, EventStatusBadge } from '@/components/event/event-badges';
import { eventApi } from '@/services/event.service';
import { orgApi } from '@/services/org.service';
import { ApiClientError } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import type { EventFormValues } from '@/lib/validations/event';
import type { EventStatus } from '@/types/event';

const ESCALATORS = ['SUPERVISOR', 'MANAGER', 'ADMIN'];

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventApi.get(id),
    select: (res) => res.data,
  });
  const { data: comments } = useQuery({
    queryKey: ['event', id, 'comments'],
    queryFn: () => eventApi.listComments(id),
    select: (res) => res.data,
  });
  const { data: org } = useQuery({
    queryKey: ['org', 'context'],
    queryFn: () => orgApi.context(),
    select: (res) => res.data,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['event', id] });
    void queryClient.invalidateQueries({ queryKey: ['events'] });
  };

  const update = useMutation({
    mutationFn: (values: Partial<EventFormValues>) => eventApi.update(id, values),
    onSuccess: () => { toast.success('Event updated'); invalidate(); },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : 'Failed to update'),
  });

  const setStatus = useMutation({
    mutationFn: (status: EventStatus) => eventApi.update(id, { status } as Partial<EventFormValues & { status: string }>),
    onSuccess: () => { toast.success('Status updated'); invalidate(); },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : 'Failed to update status'),
  });

  const escalate = useMutation({
    mutationFn: () => eventApi.escalate(id),
    onSuccess: ({ data }) => { toast.success('Escalated to an incident'); router.push(`/incidents/${data.id}`); },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : 'Failed to escalate'),
  });

  const remove = useMutation({
    mutationFn: () => eventApi.remove(id),
    onSuccess: () => { toast.success('Event deleted'); void queryClient.invalidateQueries({ queryKey: ['events'] }); router.push('/events'); },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : 'Failed to delete'),
  });

  const addComment = useMutation({
    mutationFn: ({ body, mentionedUserIds }: { body: string; mentionedUserIds: string[] }) =>
      eventApi.addComment(id, body, mentionedUserIds),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['event', id, 'comments'] }),
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : 'Failed to post comment'),
  });

  const removeComment = useMutation({
    mutationFn: (commentId: string) => eventApi.removeComment(id, commentId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['event', id, 'comments'] }),
  });

  if (isLoading || !event) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const isCreator = user?.id === event.creator.id;
  const isAdmin = user?.role === 'ADMIN';
  const canEscalate = user ? ESCALATORS.includes(user.role) : false;
  const isClosed = event.status === 'CLOSED';
  const canEdit = (isCreator || isAdmin) && !isClosed;
  const canDelete = (isCreator || isAdmin) && !isClosed;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/events" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          Events
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-2xl font-bold tracking-tight">{event.title}</h1>
          <div className="flex gap-2">
            <EventPriorityBadge priority={event.priority} />
            <EventStatusBadge status={event.status} />
          </div>
        </div>
        {event.incident && (
          <p className="mt-2 text-sm text-muted-foreground">
            Escalated to incident{' '}
            <Link href={`/incidents/${event.incident.id}`} className="text-primary hover:underline">
              {event.incident.code}
            </Link>
          </p>
        )}
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-soft">
        <EventForm
          defaultValues={{
            title: event.title,
            description: event.description,
            priority: event.priority,
            machineId: event.machine?.id,
            occurredAt: toLocalInputValue(event.occurredAt),
          }}
          machines={org?.machines ?? []}
          disabled={!canEdit}
          submitting={update.isPending}
          submitLabel="Save changes"
          onSubmit={(values) => update.mutate(values)}
        />
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-soft">
        <p className="mb-3 font-display text-sm font-semibold">Attachments</p>
        <AttachmentUploader
          attachments={event.attachments}
          readOnly={isClosed}
          onUpload={(file) => eventApi.uploadAttachment(id, file)}
          onRemove={(attachmentId) => eventApi.removeAttachment(id, attachmentId)}
          invalidateKey={['event', id]}
        />
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-soft">
        <p className="mb-3 font-display text-sm font-semibold">Discussion</p>
        <CommentThread
          comments={comments ?? []}
          orgUsers={org?.users ?? []}
          currentUserId={user?.id}
          currentUserRole={user?.role}
          onAdd={(body, mentionedUserIds) => addComment.mutateAsync({ body, mentionedUserIds })}
          onRemove={(commentId) => removeComment.mutateAsync(commentId)}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {event.status === 'OPEN' && (
            <Button variant="outline" size="sm" onClick={() => setStatus.mutate('IN_PROGRESS')} disabled={setStatus.isPending}>
              Start progress
            </Button>
          )}
          {event.status === 'IN_PROGRESS' && canEscalate && (
            <Button variant="outline" size="sm" onClick={() => setStatus.mutate('RESOLVED')} disabled={setStatus.isPending}>
              Mark resolved
            </Button>
          )}
          {event.status === 'RESOLVED' && canEscalate && (
            <Button variant="outline" size="sm" onClick={() => setStatus.mutate('CLOSED')} disabled={setStatus.isPending}>
              Close event
            </Button>
          )}
          {!event.incident && canEscalate && event.status !== 'CLOSED' && (
            <Button variant="gradient" size="sm" onClick={() => escalate.mutate()} disabled={escalate.isPending}>
              {escalate.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <TrendingUp className="h-3.5 w-3.5" />}
              Escalate to incident
            </Button>
          )}
        </div>
        {canDelete && (
          <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        )}
      </div>

      {isClosed && (
        <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
          <ShieldCheck className="h-4 w-4" />
          This event is closed.
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this event?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={remove.isPending}
        onConfirm={() => remove.mutate()}
      />
    </div>
  );
}
