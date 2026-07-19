'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { IncidentForm } from '@/components/incident/incident-form';
import { incidentApi } from '@/services/incident.service';
import { orgApi } from '@/services/org.service';
import { ApiClientError } from '@/lib/api';
import type { IncidentFormValues } from '@/lib/validations/incident';

export default function NewIncidentPage() {
  const router = useRouter();

  const { data: org } = useQuery({
    queryKey: ['org', 'context'],
    queryFn: () => orgApi.context(),
    select: (res) => res.data,
  });

  const create = useMutation({
    mutationFn: (values: IncidentFormValues) => incidentApi.create(values),
    onSuccess: ({ data }) => {
      toast.success('Incident reported');
      router.push(`/incidents/${data.id}`);
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : 'Failed to report incident'),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/incidents" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" />
        Incidents
      </Link>
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Report an Incident</h1>
        <p className="text-sm text-muted-foreground">Describe what happened — a supervisor will assign and track it.</p>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-soft">
        <IncidentForm
          defaultValues={{ title: '', description: '', severity: 'MEDIUM' }}
          machines={org?.machines ?? []}
          submitting={create.isPending}
          submitLabel="Report incident"
          onSubmit={(values) => create.mutate(values)}
        />
      </div>
    </div>
  );
}
