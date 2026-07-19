'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Loader2, CloudOff } from 'lucide-react';
import { Field, TextField } from '@/components/auth/field';
import { VoiceField } from '@/components/ui/voice-field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAutosave, type AutosaveStatus } from '@/hooks/use-autosave';
import {
  shiftLogFormSchema,
  type ShiftLogFormValues,
} from '@/lib/validations/shift-log';
import type { OrgContext } from '@/types/org';

interface ShiftLogFormProps {
  defaultValues: ShiftLogFormValues;
  departments: OrgContext['departments'];
  disabled: boolean;
  onAutosave: (values: Partial<ShiftLogFormValues>) => Promise<void>;
}

function AutosaveIndicator({ status }: { status: AutosaveStatus }) {
  if (status === 'saving') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" /> Saving…
      </span>
    );
  }
  if (status === 'saved') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-success">
        <Check className="h-3 w-3" /> Saved
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-destructive">
        <CloudOff className="h-3 w-3" /> Couldn&apos;t save
      </span>
    );
  }
  return null;
}

export function ShiftLogForm({
  defaultValues,
  departments,
  disabled,
  onAutosave,
}: ShiftLogFormProps) {
  const { register, control, watch } = useForm<ShiftLogFormValues>({
    resolver: zodResolver(shiftLogFormSchema),
    defaultValues,
  });

  const values = watch();
  const status = useAutosave({
    data: values,
    onSave: onAutosave,
    enabled: !disabled,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="font-display text-sm font-semibold">Shift details</p>
        <AutosaveIndicator status={status} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Shift date" htmlFor="shiftDate">
          <TextField
            id="shiftDate"
            type="date"
            disabled={disabled}
            {...register('shiftDate')}
          />
        </Field>

        <Field label="Shift" htmlFor="shiftType">
          <SelectField control={control} name="shiftType" disabled={disabled}>
            <SelectItem value="MORNING">Morning</SelectItem>
            <SelectItem value="AFTERNOON">Afternoon</SelectItem>
            <SelectItem value="NIGHT">Night</SelectItem>
          </SelectField>
        </Field>

        {departments.length > 0 && (
          <Field label="Department" htmlFor="departmentId" className="sm:col-span-2">
            <SelectField control={control} name="departmentId" disabled={disabled} placeholder="Select department">
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectField>
          </Field>
        )}

        <Field label="Equipment status" htmlFor="equipmentStatus" className="sm:col-span-2">
          <TextField
            id="equipmentStatus"
            placeholder="e.g. Nominal — no deviations observed"
            disabled={disabled}
            {...register('equipmentStatus')}
          />
        </Field>

        <Field label="Temperature (°C)" htmlFor="temperature">
          <TextField
            id="temperature"
            type="number"
            step="0.1"
            disabled={disabled}
            {...register('temperature', { valueAsNumber: true })}
          />
        </Field>

        <Field label="Pressure (bar)" htmlFor="pressure">
          <TextField
            id="pressure"
            type="number"
            step="0.1"
            disabled={disabled}
            {...register('pressure', { valueAsNumber: true })}
          />
        </Field>

        <Field label="Production notes" htmlFor="productionNotes" className="sm:col-span-2">
          <VoiceField control={control} name="productionNotes" disabled={disabled}
            placeholder="Throughput, output, deviations from target… or tap the mic to dictate" />
        </Field>

        <Field label="Safety notes" htmlFor="safetyNotes" className="sm:col-span-2">
          <VoiceField control={control} name="safetyNotes" disabled={disabled}
            placeholder="PPE compliance, near-misses, safety observations…" />
        </Field>

        <Field label="Remarks" htmlFor="remarks" className="sm:col-span-2">
          <VoiceField control={control} name="remarks" disabled={disabled}
            placeholder="Anything else the next shift should know…" />
        </Field>
      </div>
    </div>
  );
}

/** Bridges RHF's Controller to our Radix-based Select, which isn't a native input. */
function SelectField({
  control,
  name,
  disabled,
  placeholder,
  children,
}: {
  control: ReturnType<typeof useForm<ShiftLogFormValues>>['control'];
  name: keyof ShiftLogFormValues;
  disabled?: boolean;
  placeholder?: string;
  children: React.ReactNode;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Select
          value={(field.value as string | undefined) ?? undefined}
          disabled={disabled}
          onValueChange={field.onChange}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>{children}</SelectContent>
        </Select>
      )}
    />
  );
}
