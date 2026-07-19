import { z } from 'zod';

const role = z.enum(['OPERATOR', 'SUPERVISOR', 'MANAGER', 'ADMIN']);
const status = z.enum(['ACTIVE', 'INVITED', 'SUSPENDED', 'DEACTIVATED']);

export const listUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    role: role.optional(),
    status: status.optional(),
    search: z.string().max(200).optional(),
  }),
});

export const inviteUserSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.string().email(),
    role,
    departmentId: z.string().optional(),
    jobTitle: z.string().max(150).optional(),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    role: role.optional(),
    status: status.optional(),
    departmentId: z.string().nullable().optional(),
    jobTitle: z.string().max(150).optional(),
  }),
});

export const idParamSchema = z.object({ params: z.object({ id: z.string().min(1) }) });

export const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(150),
    code: z.string().min(1).max(20),
  }),
});

export const updateDepartmentSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    name: z.string().min(1).max(150).optional(),
    code: z.string().min(1).max(20).optional(),
  }),
});

export const createMachineSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(150),
    tag: z.string().min(1).max(50),
    type: z.string().max(100).optional(),
    departmentId: z.string().optional(),
    healthScore: z.coerce.number().int().min(0).max(100).optional(),
  }),
});

export const updateMachineSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    name: z.string().min(1).max(150).optional(),
    tag: z.string().min(1).max(50).optional(),
    type: z.string().max(100).optional(),
    status: z.enum(['RUNNING', 'IDLE', 'MAINTENANCE', 'FAULT', 'OFFLINE']).optional(),
    departmentId: z.string().nullable().optional(),
    healthScore: z.coerce.number().int().min(0).max(100).optional(),
  }),
});

export const updatePlantSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    name: z.string().min(1).max(150).optional(),
    location: z.string().max(200).optional(),
    isActive: z.boolean().optional(),
  }),
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
export type ListUsersQuery = z.infer<typeof listUsersSchema>['query'];
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>['body'];
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>['body'];
export type CreateMachineInput = z.infer<typeof createMachineSchema>['body'];
export type UpdateMachineInput = z.infer<typeof updateMachineSchema>['body'];
export type UpdatePlantInput = z.infer<typeof updatePlantSchema>['body'];
