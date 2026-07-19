import { z } from 'zod';

export const incidentFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(1, 'Description is required').max(4000),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  machineId: z.string().optional(),
});

export type IncidentFormValues = z.infer<typeof incidentFormSchema>;

export const capaFormSchema = z.object({
  type: z.enum(['CORRECTIVE', 'PREVENTIVE']),
  action: z.string().min(3, 'Describe the action').max(1000),
  ownerId: z.string().optional(),
  dueDate: z.string().optional(),
});

export type CapaFormValues = z.infer<typeof capaFormSchema>;
