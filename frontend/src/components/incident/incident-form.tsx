'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field, TextField } from '@/components/auth/field';
import { VoiceField } from '@/components/ui/voice-field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { incidentFormSchema, type IncidentFormValues } from '@/lib/validations/incident';
import type { OrgContext } from '@/types/org';

export function IncidentForm({
  defaultValues,
  machines,
  disabled,
  submitting,
  submitLabel,
  onSubmit,
}: {
  defaultValues: IncidentFormValues;
  machines: OrgContext['machines'];
  disabled?: boolean;
  submitting?: boolean;
  submitLabel: string;
  onSubmit: (values: IncidentFormValues) => void;
}) {
  const { register, control, handleSubmit, formState: { errors } } = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentFormSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Title" htmlFor="title" error={errors.title?.message}>
        <TextField id="title" disabled={disabled} placeholder="e.g. Pressure relief valve failure on Reactor-2" {...register('title')} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Severity" htmlFor="severity">
          <Controller
            control={control}
            name="severity"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={disabled}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        {machines.length > 0 && (
          <Field label="Machine (optional)" htmlFor="machineId">
            <Controller
              control={control}
              name="machineId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={disabled}>
                  <SelectTrigger><SelectValue placeholder="No specific machine" /></SelectTrigger>
                  <SelectContent>
                    {machines.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name} ({m.tag})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
        )}
      </div>

      <Field label="Description" htmlFor="description" error={errors.description?.message}>
        <VoiceField control={control} name="description" disabled={disabled}
          placeholder="What happened, immediate impact, any action already taken… or tap the mic to dictate" />
      </Field>

      <Button type="submit" variant="gradient" disabled={disabled || submitting}>
        {submitting ? 'Saving…' : submitLabel}
      </Button>
    </form>
  );
}
