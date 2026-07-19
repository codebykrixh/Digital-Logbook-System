'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { adminApi } from '@/services/admin.service';
import { ApiClientError } from '@/lib/api';

export function DepartmentsTab() {
  const queryClient = useQueryClient();
  const [name, setName] = React.useState('');
  const [code, setCode] = React.useState('');

  const { data: departments, isLoading } = useQuery({
    queryKey: ['admin', 'departments'],
    queryFn: () => adminApi.listDepartments(),
    select: (res) => res.data,
  });

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] });

  const create = useMutation({
    mutationFn: () => adminApi.createDepartment({ name, code }),
    onSuccess: () => { toast.success('Department created'); setName(''); setCode(''); invalidate(); },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : 'Failed to create'),
  });
  const remove = useMutation({
    mutationFn: (id: string) => adminApi.removeDepartment(id),
    onSuccess: invalidate,
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : 'Failed to delete'),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Department name" className="max-w-[220px]" />
        <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code (e.g. OPS)" className="max-w-[140px]" />
        <Button variant="gradient" onClick={() => create.mutate()} disabled={!name || !code || create.isPending}>
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full rounded-2xl" />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
          <table className="w-full text-sm">
            <tbody>
              {(departments ?? []).map((d) => (
                <tr key={d.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{d.code} · {d._count.users} users · {d._count.machines} machines</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => remove.mutate(d.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
              {(departments ?? []).length === 0 && (
                <tr><td className="px-4 py-8 text-center text-sm text-muted-foreground">No departments yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
