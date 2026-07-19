import { z } from 'zod';

const shiftType = z.enum(['MORNING', 'AFTERNOON', 'NIGHT']);
const logStatus = z.enum(['DRAFT', 'SUBMITTED', 'SIGNED', 'ARCHIVED']);

const numericField = z
  .union([z.number(), z.string().length(0)])
  .optional()
  .transform((v) => (v === '' || v === undefined ? undefined : Number(v)));

export const createShiftLogSchema = z.object({
  body: z.object({
    departmentId: z.string().optional(),
    shiftType,
    shiftDate: z.coerce.date(),
    equipmentStatus: z.string().max(500).optional(),
    temperature: numericField,
    pressure: numericField,
    productionNotes: z.string().max(2000).optional(),
    safetyNotes: z.string().max(2000).optional(),
    remarks: z.string().max(2000).optional(),
  }),
});

export const updateShiftLogSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    departmentId: z.string().optional(),
    shiftType: shiftType.optional(),
    shiftDate: z.coerce.date().optional(),
    equipmentStatus: z.string().max(500).optional(),
    temperature: numericField,
    pressure: numericField,
    productionNotes: z.string().max(2000).optional(),
    safetyNotes: z.string().max(2000).optional(),
    remarks: z.string().max(2000).optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const attachmentParamSchema = z.object({
  params: z.object({ id: z.string().min(1), attachmentId: z.string().min(1) }),
});

export const listShiftLogsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    status: logStatus.optional(),
    shiftType: shiftType.optional(),
    departmentId: z.string().optional(),
    search: z.string().max(200).optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    mine: z.coerce.boolean().optional(),
    sortBy: z.enum(['shiftDate', 'createdAt', 'status']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export type CreateShiftLogInput = z.infer<typeof createShiftLogSchema>['body'];
export type UpdateShiftLogInput = z.infer<typeof updateShiftLogSchema>['body'];
export type ListShiftLogsQuery = z.infer<typeof listShiftLogsSchema>['query'];
