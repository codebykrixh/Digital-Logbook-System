import { z } from 'zod';

export const listNotificationsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }),
});

export const markReadSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Notification id is required'),
  }),
});
