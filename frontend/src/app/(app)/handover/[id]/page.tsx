'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, Trash2, RefreshCw, PenLine, CheckCircle2, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { VoiceTextarea } from '@/components/ui/voice-textarea';
import { ChecklistEditor } from '@/components/handover/checklist-editor';
import { SignaturePad } from '@/components/handover/signature-pad';
import { HandoverStatusBadge } from '@/components/handover/handover-status-badge';
import { handoverApi } from '@/services/handover.service';
import { ApiClientError } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

const SHIFT_LABEL: Record<string, string> = { MORNING: 'Morning', AFTERNOON: 'Afternoon', NIGHT: 'Night' };

export default function HandoverDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [signature, setSignature] = React.useState('');
  const [showSignPad, setShowSignPad] = React.useState(false);

  const { data: handover, isLoading } = useQuery({
    queryKey: ['handover', id],
    queryFn: () => handoverApi.get(id),
    select: (res) => res.data,
  });

  const [summary, setSummary] = React.useState('');
  const [pendingWork, setPendingWork] = React.useState('');
  const [supervisorNote, setSupervisorNote] = React.useState('');
  const [checklist, setChecklist] = React.useState<{ id: string; label: string; done: boolean }[]>([]);

  React.useEffect(() => {
    if (handover) {
      setSummary(handover.summary ?? '');
      setPendingWork(handover.pendingWork ?? '');
      setSupervisorNote(handover.supervisorNote ?? '');
      setChecklist(handover.checklist ?? []);
    }
  }, [handover]);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['handover', id] });
    void queryClient.invalidateQueries({ queryKey: ['handovers'] });
  };

  const save = useMutation({
    mutationFn: () => handoverApi.update(id, { summary, pendingWork, supervisorNote, checklist }),
    onSuccess: () => { toast.success('Saved'); invalidate(); },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : 'Failed to save'),
  });

  const regenerate = useMutation({
    mutationFn: () => handoverApi.regenerateSummary(id),
    onSuccess: ({ data }) => { setSummary(data.summary ?? ''); toast.success('Summary regenerated'); },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : 'Failed to regenerate'),
  });

  const sign = useMutation({
    mutationFn: () => handoverApi.sign(id, signature),
    onSuccess: () => { toast.success('Handover signed'); setShowSignPad(false); invalidate(); },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : 'Failed to sign'),
  });

  const acknowledge = useMutation({
    mutationFn: () => handoverApi.acknowledge(id),
    onSuccess: () => { toast.success('Acknowledged'); invalidate(); },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : 'Failed to acknowledge'),
  });

  const remove = useMutation({
    mutationFn: () => handoverApi.remove(id),
    onSuccess: () => { toast.success('Handover deleted'); void queryClient.invalidateQueries({ queryKey: ['handovers'] }); router.push('/handover'); },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : 'Failed to delete'),
  });

  const [downloading, setDownloading] = React.useState(false);
  const downloadPdf = async () => {
    setDownloading(true);
    try {
      await handoverApi.downloadPdf(id, accessToken);
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading || !handover) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const isFromUser = user?.id === handover.fromUser.id;
  const isToUser = user?.id === handover.toUser?.id;
  const isAdmin = user?.role === 'ADMIN';
  const isDraft = handover.status === 'DRAFT';
  const canEdit = (isFromUser || isAdmin) && isDraft;
  const canSign = isFromUser && isDraft && !!handover.toUser;
  const canAcknowledge = isToUser && handover.status === 'PENDING_ACK';
  const canDelete = (isFromUser || isAdmin) && isDraft;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/handover" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          Handover
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              {SHIFT_LABEL[handover.shiftType]} shift — {new Date(handover.shiftDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </h1>
            <p className="font-mono text-xs text-muted-foreground">{handover.code}</p>
          </div>
          <HandoverStatusBadge status={handover.status} />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {handover.fromUser.firstName} {handover.fromUser.lastName} → {handover.toUser ? `${handover.toUser.firstName} ${handover.toUser.lastName}` : 'Unassigned'}
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-soft">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-display text-sm font-semibold">Summary</p>
          {canEdit && (
            <Button size="sm" variant="ghost" onClick={() => regenerate.mutate()} disabled={regenerate.isPending}>
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate
            </Button>
          )}
        </div>
        <VoiceTextarea value={summary} onChange={setSummary} disabled={!canEdit} placeholder="Auto-generated from your shift logs and open incidents" className="min-h-[120px]" />
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-soft">
        <p className="mb-3 font-display text-sm font-semibold">Pending work</p>
        <VoiceTextarea value={pendingWork} onChange={setPendingWork} disabled={!canEdit} placeholder="What still needs attention next shift…" />
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-soft">
        <p className="mb-3 font-display text-sm font-semibold">Checklist</p>
        <ChecklistEditor items={checklist} onChange={setChecklist} disabled={!canEdit} />
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-soft">
        <p className="mb-3 font-display text-sm font-semibold">Supervisor note (optional)</p>
        <VoiceTextarea value={supervisorNote} onChange={setSupervisorNote} disabled={!canEdit} placeholder="Anything the incoming operator's supervisor should flag…" />
      </div>

      {canEdit && (
        <Button variant="outline" onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      )}

      {handover.signatureData && (
        <div className="rounded-2xl border bg-card p-6 shadow-soft">
          <p className="mb-3 font-display text-sm font-semibold">Signature</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={handover.signatureData} alt="Signature" className="h-24 rounded-lg border bg-white p-2" />
          <p className="mt-2 text-xs text-muted-foreground">Signed {handover.signedAt && new Date(handover.signedAt).toLocaleString('en-IN')}</p>
        </div>
      )}

      {canSign && !showSignPad && (
        <Button variant="gradient" onClick={() => setShowSignPad(true)}>
          <PenLine className="h-4 w-4" />
          Sign &amp; hand off
        </Button>
      )}

      {canSign && showSignPad && (
        <div className="space-y-3 rounded-2xl border bg-card p-6 shadow-soft">
          <p className="font-display text-sm font-semibold">Sign to complete handover</p>
          <SignaturePad onCapture={setSignature} />
          <div className="flex gap-2">
            <Button variant="gradient" onClick={() => sign.mutate()} disabled={!signature || sign.isPending}>
              {sign.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm signature'}
            </Button>
            <Button variant="ghost" onClick={() => setShowSignPad(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {canAcknowledge && (
            <Button variant="gradient" onClick={() => acknowledge.mutate()} disabled={acknowledge.isPending}>
              <CheckCircle2 className="h-4 w-4" />
              Acknowledge receipt
            </Button>
          )}
          {!isDraft && (
            <Button variant="outline" onClick={downloadPdf} disabled={downloading}>
              <Download className="h-4 w-4" />
              {downloading ? 'Downloading…' : 'Download PDF'}
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

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this handover?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={remove.isPending}
        onConfirm={() => remove.mutate()}
      />
    </div>
  );
}
