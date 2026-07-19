import { z } from 'zod';

export const shiftLogFormSchema = z.object({
  departmentId: z.string().optional(),
  shiftType: z.enum(['MORNING', 'AFTERNOON', 'NIGHT']),
  shiftDate: z.string().min(1, 'Shift date is required'),
  equipmentStatus: z.string().max(500).optional().or(z.literal('')),
  temperature: z
    .union([z.number(), z.nan()])
    .optional()
    .transform((v) => (v === undefined || Number.isNaN(v) ? undefined : v)),
  pressure: z
    .union([z.number(), z.nan()])
    .optional()
    .transform((v) => (v === undefined || Number.isNaN(v) ? undefined : v)),
  productionNotes: z.string().max(2000).optional().or(z.literal('')),
  safetyNotes: z.string().max(2000).optional().or(z.literal('')),
  remarks: z.string().max(2000).optional().or(z.literal('')),
});

export type ShiftLogFormValues = z.infer<typeof shiftLogFormSchema>;
