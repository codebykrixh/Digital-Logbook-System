'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { adminApi } from '@/services/admin.service';
import { orgApi } from '@/services/org.service';
import { ApiClientError } from '@/lib/api';

const STATUSES = ['RUNNING', 'IDLE', 'MAINTENANCE', 'FAULT', 'OFFLINE'];

export function MachinesTab() {
  const queryClient = useQueryClient();
  const [name, setName] = React.useState('');
  const [tag, setTag] = React.useState('');

  const { data: machines, isLoading } = useQuery({
    queryKey: ['admin', 'machines'],
    queryFn: () => adminApi.listMachines(),
    select: (res) => res.data,
  });
  const { data: org } = useQuery({ queryKey: ['org', 'context'], queryFn: () => orgApi.context(), select: (res) => res.data });

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['admin', 'machines'] });

  const create = useMutation({
    mutationFn: () => adminApi.createMachine({ name, tag }),
    onSuccess: () => { toast.success('Machine created'); setName(''); setTag(''); invalidate(); },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : 'Failed to create'),
  });
  const update = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Record<string, unknown> }) => adminApi.updateMachine(id, values),
    onSuccess: invalidate,
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : 'Failed to update'),
  });
  const remove = useMutation({
    mutationFn: (id: string) => adminApi.removeMachine(id),
    onSuccess: invalidate,
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : 'Failed to delete'),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Machine name" className="max-w-[220px]" />
        <Input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Tag (e.g. CMP-04)" className="max-w-[160px]" />
        <Button variant="gradient" onClick={() => create.mutate()} disabled={!name || !tag || create.isPending}>
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full rounded-2xl" />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Machine</th>
                <th className="px-4 py-3 text-left font-medium">Department</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {(machines ?? []).map((m) => (
                <tr key={m.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.tag} · health {m.healthScore}%</p>
                  </td>
                  <td className="px-4 py-3">
                    <Select value={m.departmentId ?? undefined} onValueChange={(v) => update.mutate({ id: m.id, values: { departmentId: v } })}>
                      <SelectTrigger className="h-8 w-40"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                      <SelectContent>
                        {(org?.departments ?? []).map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <Select value={m.status} onValueChange={(v) => update.mutate({ id: m.id, values: { status: v } })}>
                      <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => remove.mutate(m.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
              {(machines ?? []).length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">No machines yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
