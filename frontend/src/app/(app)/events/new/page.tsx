'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { EventForm } from '@/components/event/event-form';
import { eventApi } from '@/services/event.service';
import { orgApi } from '@/services/org.service';
import { ApiClientError } from '@/lib/api';
import type { EventFormValues } from '@/lib/validations/event';

function nowLocalIso() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function NewEventPage() {
  const router = useRouter();

  const { data: org } = useQuery({
    queryKey: ['org', 'context'],
    queryFn: () => orgApi.context(),
    select: (res) => res.data,
  });

  const create = useMutation({
    mutationFn: (values: EventFormValues) => eventApi.create(values),
    onSuccess: ({ data }) => {
      toast.success('Event created');
      router.push(`/events/${data.id}`);
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : 'Failed to create event'),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/events" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" />
        Events
      </Link>
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">New Event</h1>
        <p className="text-sm text-muted-foreground">Record what happened, when, and its priority.</p>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-soft">
        <EventForm
          defaultValues={{ title: '', description: '', priority: 'ROUTINE', occurredAt: nowLocalIso() }}
          machines={org?.machines ?? []}
          submitting={create.isPending}
          submitLabel="Create event"
          onSubmit={(values) => create.mutate(values)}
        />
      </div>
    </div>
  );
}
