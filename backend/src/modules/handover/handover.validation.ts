import { z } from 'zod';

const shiftType = z.enum(['MORNING', 'AFTERNOON', 'NIGHT']);
const checklistItem = z.object({
  id: z.string(),
  label: z.string().min(1).max(300),
  done: z.boolean(),
});

export const createHandoverSchema = z.object({
  body: z.object({
    shiftType,
    shiftDate: z.coerce.date(),
    toUserId: z.string().optional(),
  }),
});

export const updateHandoverSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    toUserId: z.string().optional(),
    summary: z.string().max(4000).optional(),
    pendingWork: z.string().max(4000).optional(),
    supervisorNote: z.string().max(2000).optional(),
    checklist: z.array(checklistItem).max(50).optional(),
  }),
});

export const signHandoverSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    signatureData: z.string().min(1, 'A signature is required'),
  }),
});

export const idParamSchema = z.object({ params: z.object({ id: z.string().min(1) }) });

export const listHandoversSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    status: z.enum(['DRAFT', 'PENDING_ACK', 'ACKNOWLEDGED']).optional(),
    mine: z.coerce.boolean().optional(),
    forMe: z.coerce.boolean().optional(),
  }),
});

export type CreateHandoverInput = z.infer<typeof createHandoverSchema>['body'];
export type UpdateHandoverInput = z.infer<typeof updateHandoverSchema>['body'];
export type ListHandoversQuery = z.infer<typeof listHandoversSchema>['query'];
