import { z } from 'zod';

const severity = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
const status = z.enum(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED']);
const capaType = z.enum(['CORRECTIVE', 'PREVENTIVE']);
const capaStatus = z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED']);

export const createIncidentSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200),
    description: z.string().min(1).max(4000),
    severity: severity.optional(),
    machineId: z.string().optional(),
  }),
});

export const updateIncidentSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().min(1).max(4000).optional(),
    rootCause: z.string().max(4000).optional(),
    severity: severity.optional(),
    status: status.optional(),
    assigneeId: z.string().optional(),
    machineId: z.string().optional(),
  }),
});

export const idParamSchema = z.object({ params: z.object({ id: z.string().min(1) }) });

export const listIncidentsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    status: status.optional(),
    severity: severity.optional(),
    mine: z.coerce.boolean().optional(),
    assignedToMe: z.coerce.boolean().optional(),
    search: z.string().max(200).optional(),
    sortBy: z.enum(['createdAt', 'severity', 'status']).optional(),
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

export const createCapaSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    type: capaType,
    action: z.string().min(3).max(1000),
    ownerId: z.string().optional(),
    dueDate: z.coerce.date().optional(),
  }),
});

export const updateCapaSchema = z.object({
  params: z.object({ id: z.string().min(1), capaId: z.string().min(1) }),
  body: z.object({
    action: z.string().min(3).max(1000).optional(),
    status: capaStatus.optional(),
    ownerId: z.string().optional(),
    dueDate: z.coerce.date().optional(),
  }),
});

export const capaParamSchema = z.object({
  params: z.object({ id: z.string().min(1), capaId: z.string().min(1) }),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>['body'];
export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>['body'];
export type ListIncidentsQuery = z.infer<typeof listIncidentsSchema>['query'];
export type CreateCapaInput = z.infer<typeof createCapaSchema>['body'];
export type UpdateCapaInput = z.infer<typeof updateCapaSchema>['body'];
