'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  Send,
  ShieldCheck,
  Trash2,
  Thermometer,
  Gauge,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ShiftLogStatusBadge } from '@/components/shift-log/status-badge';
import { ShiftLogForm } from '@/components/shift-log/shift-log-form';
import { AttachmentUploader } from '@/components/shared/attachment-uploader';
import { shiftLogApi } from '@/services/shift-log.service';
import { orgApi } from '@/services/org.service';
import { ApiClientError } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import type { ShiftLogFormValues } from '@/lib/validations/shift-log';

const SIGNER_ROLES = ['SUPERVISOR', 'MANAGER', 'ADMIN'];

export default function ShiftLogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const { data: log, isLoading } = useQuery({
    queryKey: ['shift-log', id],
    queryFn: () => shiftLogApi.get(id),
    select: (res) => res.data,
  });

  const { data: org } = useQuery({
    queryKey: ['org', 'context'],
    queryFn: () => orgApi.context(),
    select: (res) => res.data,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['shift-log', id] });
    void queryClient.invalidateQueries({ queryKey: ['shift-logs'] });
  };

  const submitMutation = useMutation({
    mutationFn: () => shiftLogApi.submit(id),
    onSuccess: () => {
      toast.success('Shift log submitted for sign-off');
      invalidate();
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : 'Failed to submit'),
  });

  const signMutation = useMutation({
    mutationFn: () => shiftLogApi.sign(id),
    onSuccess: () => {
      toast.success('Shift log signed');
      invalidate();
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : 'Failed to sign'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => shiftLogApi.remove(id),
    onSuccess: () => {
      toast.success('Shift log deleted');
      void queryClient.invalidateQueries({ queryKey: ['shift-logs'] });
      router.push('/shift-logbook');
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : 'Failed to delete'),
  });

  if (isLoading || !log) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const isAuthor = user?.id === log.author.id;
  const isAdmin = user?.role === 'ADMIN';
  const canSign = user ? SIGNER_ROLES.includes(user.role) : false;
  const isEditable = log.status === 'DRAFT' || log.status === 'SUBMITTED';
  const disabled = !isEditable || (!isAuthor && !isAdmin);
  const canDelete = (isAuthor || isAdmin) && isEditable;

  const defaultValues: ShiftLogFormValues = {
    departmentId: log.department?.id,
    shiftType: log.shiftType,
    shiftDate: log.shiftDate.slice(0, 10),
    equipmentStatus: log.equipmentStatus ?? '',
    temperature: log.temperature ?? undefined,
    pressure: log.pressure ?? undefined,
    productionNotes: log.productionNotes ?? '',
    safetyNotes: log.safetyNotes ?? '',
    remarks: log.remarks ?? '',
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/shift-logbook"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Shift Logbook
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              {log.author.firstName} {log.author.lastName}&apos;s shift log
            </h1>
            <p className="font-mono text-xs text-muted-foreground">{log.code}</p>
          </div>
          <ShiftLogStatusBadge status={log.status} />
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-soft">
        <ShiftLogForm
          defaultValues={defaultValues}
          departments={org?.departments ?? []}
          disabled={disabled}
          onAutosave={async (values) => {
            await shiftLogApi.update(id, values);
          }}
        />
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-soft">
        <p className="mb-3 font-display text-sm font-semibold">Attachments</p>
        <AttachmentUploader
          attachments={log.attachments}
          readOnly={disabled}
          onUpload={(file) => shiftLogApi.uploadAttachment(id, file)}
          onRemove={(attachmentId) => shiftLogApi.removeAttachment(id, attachmentId)}
          invalidateKey={['shift-log', id]}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {log.status === 'DRAFT' && isAuthor && (
            <Button
              variant="gradient"
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Submit for sign-off
            </Button>
          )}
          {log.status === 'SUBMITTED' && canSign && (
            <Button
              variant="gradient"
              onClick={() => signMutation.mutate()}
              disabled={signMutation.isPending}
            >
              {signMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              Sign shift log
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

      {log.status === 'SIGNED' && log.signedAt && (
        <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
          <ShieldCheck className="h-4 w-4" />
          Signed on {new Date(log.signedAt).toLocaleString('en-IN')}
        </div>
      )}

      {(log.temperature !== null || log.pressure !== null) && (
        <div className="flex gap-4 text-xs text-muted-foreground">
          {log.temperature !== null && (
            <span className="flex items-center gap-1">
              <Thermometer className="h-3.5 w-3.5" /> {log.temperature}°C
            </span>
          )}
          {log.pressure !== null && (
            <span className="flex items-center gap-1">
              <Gauge className="h-3.5 w-3.5" /> {log.pressure} bar
            </span>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this shift log?"
        description="This action cannot be undone. Signed shift logs can never be deleted."
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  );
}
