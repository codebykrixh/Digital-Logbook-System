'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Field, TextField } from '@/components/auth/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { handoverApi } from '@/services/handover.service';
import { orgApi } from '@/services/org.service';
import { ApiClientError } from '@/lib/api';

export default function NewHandoverPage() {
  const router = useRouter();
  const [shiftType, setShiftType] = React.useState('MORNING');
  const [shiftDate, setShiftDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [toUserId, setToUserId] = React.useState<string | undefined>();

  const { data: org } = useQuery({
    queryKey: ['org', 'context'],
    queryFn: () => orgApi.context(),
    select: (res) => res.data,
  });

  const create = useMutation({
    mutationFn: () => handoverApi.create({ shiftType, shiftDate, toUserId }),
    onSuccess: ({ data }) => {
      toast.success('Handover created with an auto-generated summary');
      router.push(`/handover/${data.id}`);
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : 'Failed to create handover'),
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link href="/handover" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" />
        Handover
      </Link>
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">New Handover</h1>
        <p className="text-sm text-muted-foreground">We&apos;ll pull in your shift logs and open incidents to start the summary.</p>
      </div>

      <div className="space-y-4 rounded-2xl border bg-card p-6 shadow-soft">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Shift date" htmlFor="shiftDate">
            <TextField id="shiftDate" type="date" value={shiftDate} onChange={(e) => setShiftDate(e.target.value)} />
          </Field>
          <Field label="Shift" htmlFor="shiftType">
            <Select value={shiftType} onValueChange={setShiftType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MORNING">Morning</SelectItem>
                <SelectItem value="AFTERNOON">Afternoon</SelectItem>
                <SelectItem value="NIGHT">Night</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="Handing over to" htmlFor="toUserId">
          <Select value={toUserId} onValueChange={setToUserId}>
            <SelectTrigger><SelectValue placeholder="Select the incoming operator" /></SelectTrigger>
            <SelectContent>
              {(org?.users ?? []).map((u) => (
                <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName} · {u.role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Button variant="gradient" onClick={() => create.mutate()} disabled={create.isPending}>
          {create.isPending ? 'Generating summary…' : 'Create handover'}
        </Button>
      </div>
    </div>
  );
}
