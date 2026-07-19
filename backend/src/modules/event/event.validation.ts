import { z } from 'zod';

const priority = z.enum(['ROUTINE', 'MAINTENANCE', 'EMERGENCY']);
const status = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']);

export const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200),
    description: z.string().min(1).max(4000),
    priority: priority.optional(),
    machineId: z.string().optional(),
    occurredAt: z.coerce.date().optional(),
  }),
});

export const updateEventSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().min(1).max(4000).optional(),
    priority: priority.optional(),
    status: status.optional(),
    machineId: z.string().optional(),
    occurredAt: z.coerce.date().optional(),
  }),
});

export const idParamSchema = z.object({ params: z.object({ id: z.string().min(1) }) });

export const listEventsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    status: status.optional(),
    priority: priority.optional(),
    machineId: z.string().optional(),
    search: z.string().max(200).optional(),
    mine: z.coerce.boolean().optional(),
    sortBy: z.enum(['occurredAt', 'createdAt', 'priority', 'status']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const addCommentSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    body: z.string().min(1).max(2000),
    mentionedUserIds: z.array(z.string()).max(20).optional(),
  }),
});

export const commentParamSchema = z.object({
  params: z.object({ id: z.string().min(1), commentId: z.string().min(1) }),
});

export type CreateEventInput = z.infer<typeof createEventSchema>['body'];
export type UpdateEventInput = z.infer<typeof updateEventSchema>['body'];
export type ListEventsQuery = z.infer<typeof listEventsSchema>['query'];
