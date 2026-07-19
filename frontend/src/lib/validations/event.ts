import { z } from 'zod';

export const eventFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(1, 'Description is required').max(4000),
  priority: z.enum(['ROUTINE', 'MAINTENANCE', 'EMERGENCY']),
  machineId: z.string().optional(),
  occurredAt: z.string().min(1, 'Date is required'),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;
