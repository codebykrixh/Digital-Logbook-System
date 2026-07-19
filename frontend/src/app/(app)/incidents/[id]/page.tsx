'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, Trash2, Megaphone, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Field } from '@/components/auth/field';
import { VoiceTextarea } from '@/components/ui/voice-textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AttachmentUploader } from '@/components/shared/attachment-uploader';
import { CommentThread } from '@/components/shared/comment-thread';
import { IncidentForm } from '@/components/incident/incident-form';
import { IncidentSeverityBadge, IncidentStatusBadge } from '@/components/incident/incident-badges';
import { CapaList } from '@/components/incident/capa-list';
import { incidentApi } from '@/services/incident.service';
import { orgApi } from '@/services/org.service';
import { ApiClientError } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import type { CapaFormValues } from '@/lib/validations/incident';
import type { IncidentStatus, CapaStatus } from '@/types/incident';

const SUPERVISORS = ['SUPERVISOR', 'MANAGER', 'ADMIN'];
const NEXT_STATUS: Partial<Record<IncidentStatus, { next: IncidentStatus; label: string }>> = {
  ASSIGNED: { next: 'IN_PROGRESS', label: 'Start work' },
  IN_PROGRESS: { next: 'UNDER_REVIEW', label: 'Send for review' },
  UNDER_REVIEW: { next: 'RESOLVED', label: 'Mark resolved' },
  RESOLVED: { next: 'CLOSED', label: 'Close incident' },
};

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [rootCause, setRootCause] = React.useState('');

  const { data: incident, isLoading } = useQuery({
    queryKey: ['incident', id],
    queryFn: () => incidentApi.get(id),
    select: (res) => res.data,
  });
  const { data: comments } = useQuery({
    queryKey: ['incident', id, 'comments'],
    queryFn: () => incidentApi.listComments(id),
    select: (res) => res.data,
  });
  const { data: org } = useQuery({
    queryKey: ['org', 'context'],
    queryFn: () => orgApi.context(),
    select: (res) => res.data,
  });

  React.useEffect(() => {
    if (incident) setRootCause(incident.rootCause ?? '');
  }, [incident]);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['incident', id] });
    void queryClient.invalidateQueries({ queryKey: ['incidents'] });
  };

  const update = useMutation({
    mutationFn: (values: Record<string, unknown>) => incidentApi.update(id, values),
    onSuccess: () => { toast.success('Incident updated'); invalidate(); },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : 'Failed to update'),
  });

  const escalate = useMutation({
    mutationFn: () => incidentApi.escalate(id),
    onSuccess: () => { toast.success('Escalated to management'); invalidate(); },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : 'Failed to escalate'),
  });

  const remove = useMutation({
    mutationFn: () => incidentApi.remove(id),
    onSuccess: () => { toast.success('Incident deleted'); void queryClient.invalidateQueries({ queryKey: ['incidents'] }); router.push('/incidents'); },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : 'Failed to delete'),
  });

  const addComment = useMutation({
    mutationFn: ({ body, mentionedUserIds }: { body: string; mentionedUserIds: string[] }) =>
      incidentApi.addComment(id, body, mentionedUserIds),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['incident', id, 'comments'] }),
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : 'Failed to post comment'),
  });
  const removeComment = useMutation({
    mutationFn: (commentId: string) => incidentApi.removeComment(id, commentId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['incident', id, 'comments'] }),
  });

  const createCapa = useMutation({
    mutationFn: (values: CapaFormValues) => incidentApi.createCapa(id, values),
    onSuccess: () => { toast.success('Action added'); invalidate(); },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : 'Failed to add action'),
  });
  const updateCapaStatus = useMutation({
    mutationFn: ({ capaId, status }: { capaId: string; status: CapaStatus }) => incidentApi.updateCapa(id, capaId, { status }),
    onSuccess: invalidate,
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : 'Failed to update action'),
  });
  const removeCapa = useMutation({
    mutationFn: (capaId: string) => incidentApi.removeCapa(id, capaId),
    onSuccess: invalidate,
  });

  if (isLoading || !incident) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const isParticipant = user?.id === incident.reporter.id || user?.id === incident.assignee?.id;
  const isAdmin = user?.role === 'ADMIN';
  const isSupervisorPlus = user ? SUPERVISORS.includes(user.role) : false;
  const isClosed = incident.status === 'CLOSED';
  const canEdit = (isParticipant || isAdmin || isSupervisorPlus) && !isClosed;
  const canDelete = (user?.id === incident.reporter.id || isAdmin) && incident.status === 'OPEN';
  const nextStep = NEXT_STATUS[incident.status];
  const nextStepAllowed = nextStep && (nextStep.next === 'IN_PROGRESS' ? canEdit : isSupervisorPlus);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/incidents" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          Incidents
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">{incident.title}</h1>
            <p className="font-mono text-xs text-muted-foreground">{incident.code}</p>
          </div>
          <div className="flex gap-2">
            <IncidentSeverityBadge severity={incident.severity} />
            <IncidentStatusBadge status={incident.status} />
          </div>
        </div>
        {incident.escalated && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-warning">
            <Megaphone className="h-3.5 w-3.5" /> Escalated to management
          </p>
        )}
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-soft">
        <IncidentForm
          defaultValues={{
            title: incident.title,
            description: incident.description,
            severity: incident.severity,
            machineId: incident.machine?.id,
          }}
          machines={org?.machines ?? []}
          disabled={!canEdit}
          submitting={update.isPending}
          submitLabel="Save changes"
          onSubmit={(values) => update.mutate(values)}
        />
      </div>

      {isSupervisorPlus && (
        <div className="rounded-2xl border bg-card p-6 shadow-soft">
          <Field label="Assignee" htmlFor="assignee">
            <Select
              value={incident.assignee?.id}
              onValueChange={(v) => update.mutate({ assigneeId: v })}
              disabled={isClosed}
            >
              <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
              <SelectContent>
                {(org?.users ?? []).map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName} · {u.role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      )}

      <div className="rounded-2xl border bg-card p-6 shadow-soft">
        <p className="mb-3 font-display text-sm font-semibold">Root cause analysis</p>
        <VoiceTextarea
          value={rootCause}
          onChange={setRootCause}
          disabled={!canEdit}
          placeholder="What caused this? … or tap the mic to dictate"
        />
        {canEdit && rootCause !== (incident.rootCause ?? '') && (
          <Button size="sm" variant="outline" className="mt-2" onClick={() => update.mutate({ rootCause })} disabled={update.isPending}>
            Save root cause
          </Button>
        )}
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-soft">
        <p className="mb-3 font-display text-sm font-semibold">Corrective &amp; Preventive Actions</p>
        <CapaList
          capas={incident.capas}
          orgUsers={org?.users ?? []}
          canManage={isSupervisorPlus}
          canVerify={isSupervisorPlus}
          currentUserId={user?.id}
          onCreate={(values) => createCapa.mutateAsync(values)}
          onUpdateStatus={(capaId, status) => updateCapaStatus.mutateAsync({ capaId, status })}
          onRemove={(capaId) => removeCapa.mutateAsync(capaId)}
        />
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-soft">
        <p className="mb-3 font-display text-sm font-semibold">Attachments</p>
        <AttachmentUploader
          attachments={incident.attachments}
          readOnly={isClosed}
          onUpload={(file) => incidentApi.uploadAttachment(id, file)}
          onRemove={(attachmentId) => incidentApi.removeAttachment(id, attachmentId)}
          invalidateKey={['incident', id]}
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
          {nextStep && nextStepAllowed && (
            <Button variant="outline" size="sm" onClick={() => update.mutate({ status: nextStep.next })} disabled={update.isPending}>
              {nextStep.label}
            </Button>
          )}
          {isSupervisorPlus && !incident.escalated && !isClosed && (
            <Button variant="gradient" size="sm" onClick={() => escalate.mutate()} disabled={escalate.isPending}>
              {escalate.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Megaphone className="h-3.5 w-3.5" />}
              Escalate
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
          This incident is closed.
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this incident?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={remove.isPending}
        onConfirm={() => remove.mutate()}
      />
    </div>
  );
}
