'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, TextField } from '@/components/auth/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { adminApi } from '@/services/admin.service';
import { orgApi } from '@/services/org.service';
import { ApiClientError } from '@/lib/api';

const ROLES = ['OPERATOR', 'SUPERVISOR', 'MANAGER', 'ADMIN'];
const STATUSES = ['ACTIVE', 'INVITED', 'SUSPENDED', 'DEACTIVATED'];

interface InviteForm {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  departmentId?: string;
}

export function UsersTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState('');
  const [inviteOpen, setInviteOpen] = React.useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin', 'users', search],
    queryFn: () => adminApi.listUsers({ search: search || undefined }),
    select: (res) => res.data,
  });
  const { data: org } = useQuery({ queryKey: ['org', 'context'], queryFn: () => orgApi.context(), select: (res) => res.data });

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });

  const update = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Record<string, unknown> }) => adminApi.updateUser(id, values),
    onSuccess: invalidate,
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : 'Failed to update user'),
  });
  const deactivate = useMutation({
    mutationFn: (id: string) => adminApi.deactivateUser(id),
    onSuccess: () => { toast.success('User deactivated'); invalidate(); },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : 'Failed to deactivate'),
  });

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<InviteForm>({
    defaultValues: { role: 'OPERATOR' },
  });
  const invite = useMutation({
    mutationFn: (values: InviteForm) => adminApi.inviteUser(values),
    onSuccess: () => { toast.success('Invitation sent'); setInviteOpen(false); reset(); invalidate(); },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : 'Failed to invite user'),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email…" className="max-w-xs" />
        <Button variant="gradient" onClick={() => setInviteOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Invite user
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Department</th>
                <th className="px-4 py-3 text-left font-medium">Role</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {(users ?? []).map((u) => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.department?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Select value={u.role} onValueChange={(v) => update.mutate({ id: u.id, values: { role: v } })}>
                      <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <Select value={u.status} onValueChange={(v) => update.mutate({ id: u.id, values: { status: v } })}>
                      <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.status !== 'DEACTIVATED' && (
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => deactivate.mutate(u.id)}>
                        Deactivate
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invite a user</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((values) => invite.mutate(values))} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name" htmlFor="firstName" error={errors.firstName?.message}>
                <TextField id="firstName" {...register('firstName', { required: 'Required' })} />
              </Field>
              <Field label="Last name" htmlFor="lastName" error={errors.lastName?.message}>
                <TextField id="lastName" {...register('lastName', { required: 'Required' })} />
              </Field>
            </div>
            <Field label="Email" htmlFor="email" error={errors.email?.message}>
              <TextField id="email" type="email" {...register('email', { required: 'Required' })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Role" htmlFor="role">
                <Controller control={control} name="role" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
              </Field>
              <Field label="Department" htmlFor="departmentId">
                <Controller control={control} name="departmentId" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>{(org?.departments ?? []).map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
              </Field>
            </div>
            <Button type="submit" variant="gradient" disabled={invite.isPending}>
              {invite.isPending ? 'Sending…' : 'Send invitation'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
