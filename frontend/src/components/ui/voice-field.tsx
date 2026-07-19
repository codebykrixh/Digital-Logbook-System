'use client';

import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { VoiceTextarea } from './voice-textarea';

interface VoiceFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
}

/** Bridges RHF's Controller to VoiceTextarea, which is a controlled component. */
export function VoiceField<T extends FieldValues>({
  control,
  name,
  disabled,
  placeholder,
  id,
}: VoiceFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <VoiceTextarea
          id={id ?? name}
          value={(field.value as string) ?? ''}
          onChange={field.onChange}
          disabled={disabled}
          placeholder={placeholder}
        />
      )}
    />
  );
}
