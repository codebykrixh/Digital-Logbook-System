'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TextField, Field } from '@/components/auth/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { capaFormSchema, type CapaFormValues } from '@/lib/validations/incident';
import type { CapaDto, CapaStatus } from '@/types/incident';
import type { OrgUser } from '@/types/org';

const STATUS_VARIANT: Record<CapaStatus, NonNullable<BadgeProps['variant']>> = {
  OPEN: 'secondary',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  VERIFIED: 'success',
};

interface CapaListProps {
  capas: CapaDto[];
  orgUsers: OrgUser[];
  canManage: boolean;
  canVerify: boolean;
  currentUserId?: string;
  onCreate: (values: CapaFormValues) => Promise<unknown>;
  onUpdateStatus: (capaId: string, status: CapaStatus) => Promise<unknown>;
  onRemove: (capaId: string) => Promise<unknown>;
}

export function CapaList({
  capas,
  orgUsers,
  canManage,
  canVerify,
  currentUserId,
  onCreate,
  onUpdateStatus,
  onRemove,
}: CapaListProps) {
  const [showForm, setShowForm] = React.useState(false);
  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CapaFormValues>({
    resolver: zodResolver(capaFormSchema),
    defaultValues: { type: 'CORRECTIVE', action: '' },
  });

  return (
    <div className="space-y-3">
      {capas.length > 0 && (
        <ul className="space-y-2">
          {capas.map((capa) => {
            const isOwner = capa.owner?.id === currentUserId;
            return (
              <li key={capa.id} className="rounded-xl border bg-background p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{capa.type}</p>
                    <p className="text-sm">{capa.action}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {capa.owner ? `${capa.owner.firstName} ${capa.owner.lastName}` : 'Unassigned'}
                      {capa.dueDate && ` · due ${new Date(capa.dueDate).toLocaleDateString('en-IN')}`}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[capa.status]}>{capa.status}</Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {capa.status === 'OPEN' && (isOwner || canManage) && (
                    <Button size="sm" variant="outline" onClick={() => onUpdateStatus(capa.id, 'IN_PROGRESS')}>Start</Button>
                  )}
                  {capa.status === 'IN_PROGRESS' && (isOwner || canManage) && (
                    <Button size="sm" variant="outline" onClick={() => onUpdateStatus(capa.id, 'COMPLETED')}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Mark complete
                    </Button>
                  )}
                  {capa.status === 'COMPLETED' && canVerify && (
                    <Button size="sm" variant="outline" onClick={() => onUpdateStatus(capa.id, 'VERIFIED')}>
                      <ShieldCheck className="h-3.5 w-3.5" /> Verify
                    </Button>
                  )}
                  {canManage && (
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => onRemove(capa.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {canManage && !showForm && (
        <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
          <Plus className="h-3.5 w-3.5" />
          Add corrective/preventive action
        </Button>
      )}

      {canManage && showForm && (
        <form
          onSubmit={handleSubmit(async (values) => {
            await onCreate(values);
            reset({ type: 'CORRECTIVE', action: '' });
            setShowForm(false);
          })}
          className="space-y-3 rounded-xl border bg-background p-3"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Type" htmlFor="capa-type">
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CORRECTIVE">Corrective</SelectItem>
                      <SelectItem value="PREVENTIVE">Preventive</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Owner" htmlFor="capa-owner">
              <Controller
                control={control}
                name="ownerId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                    <SelectContent>
                      {orgUsers.map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>
          <Field label="Action" htmlFor="capa-action" error={errors.action?.message}>
            <TextField id="capa-action" placeholder="What needs to be done" {...register('action')} />
          </Field>
          <Field label="Due date (optional)" htmlFor="capa-due">
            <TextField id="capa-due" type="date" {...register('dueDate')} />
          </Field>
          <div className="flex gap-2">
            <Button type="submit" size="sm" variant="gradient" disabled={isSubmitting}>Add action</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}
    </div>
  );
}
