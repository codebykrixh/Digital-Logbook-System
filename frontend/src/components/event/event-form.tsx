'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field, TextField } from '@/components/auth/field';
import { VoiceField } from '@/components/ui/voice-field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { eventFormSchema, type EventFormValues } from '@/lib/validations/event';
import type { OrgContext } from '@/types/org';

interface EventFormProps {
  defaultValues: EventFormValues;
  machines: OrgContext['machines'];
  disabled?: boolean;
  submitting?: boolean;
  submitLabel: string;
  onSubmit: (values: EventFormValues) => void;
}

export function EventForm({
  defaultValues,
  machines,
  disabled,
  submitting,
  submitLabel,
  onSubmit,
}: EventFormProps) {
  const { register, control, handleSubmit, formState: { errors } } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Title" htmlFor="title" error={errors.title?.message}>
        <TextField id="title" disabled={disabled} placeholder="e.g. Compressor-4 pressure fluctuation" {...register('title')} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Occurred at" htmlFor="occurredAt" error={errors.occurredAt?.message}>
          <TextField id="occurredAt" type="datetime-local" disabled={disabled} {...register('occurredAt')} />
        </Field>

        <Field label="Priority" htmlFor="priority">
          <Controller
            control={control}
            name="priority"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={disabled}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ROUTINE">Routine</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="EMERGENCY">Emergency</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        {machines.length > 0 && (
          <Field label="Machine (optional)" htmlFor="machineId" className="sm:col-span-2">
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
          placeholder="What happened, when, and any immediate action taken… or tap the mic to dictate" />
      </Field>

      <Button type="submit" variant="gradient" disabled={disabled || submitting}>
        {submitting ? 'Saving…' : submitLabel}
      </Button>
    </form>
  );
}
