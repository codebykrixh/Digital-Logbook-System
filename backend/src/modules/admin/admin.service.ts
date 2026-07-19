import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import { writeAudit } from '../../services/audit.service';
import { sendMail, resetPasswordEmail } from '../../services/mailer';
import { createEmailToken } from '../auth/auth.service';
import { parseDurationMs } from '../../utils/time';
import { env } from '../../config/env';
import { orgService } from '../org/org.service';
import { notifyUser } from '../notifications/notifications.service';

/**
 * Peer oversight: no single admin can act unwatched. Whenever one admin does
 * something sensitive to another account, every OTHER active admin is
 * notified — so a compromised or rogue admin can't quietly cover their
 * tracks, since the audit trail plus this alert both surface it immediately.
 */
async function notifyOtherAdmins(actorId: string, title: string, body: string, link: string) {
  const otherAdmins = await prisma.user.findMany({
    where: { role: 'ADMIN', status: 'ACTIVE', id: { not: actorId } },
    select: { id: true },
  });
  await Promise.all(
    otherAdmins.map((admin) =>
      notifyUser({ userId: admin.id, type: 'WARNING', title, body, link })
    )
  );
}
import type {
  InviteUserInput,
  UpdateUserInput,
  ListUsersQuery,
  CreateDepartmentInput,
  UpdateDepartmentInput,
  CreateMachineInput,
  UpdateMachineInput,
  UpdatePlantInput,
} from './admin.validation';

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  status: true,
  jobTitle: true,
  emailVerified: true,
  lastLoginAt: true,
  createdAt: true,
  department: { select: { id: true, name: true } },
} satisfies Prisma.UserSelect;

export const adminUserService = {
  async list(query: ListUsersQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = {};
    if (query.role) where.role = query.role;
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.user.findMany({ where, select: userSelect, orderBy: { firstName: 'asc' }, skip, take: limit }),
      prisma.user.count({ where }),
    ]);
    return { items, total, page, limit };
  },

  async invite(actorId: string, input: InviteUserInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw ApiError.conflict('A user with this email already exists');

    const { plant } = await orgService.getContextForUser(actorId);
    const tempPasswordHash = await bcrypt.hash(nanoid(32), 12);

    const user = await prisma.user.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        role: input.role,
        jobTitle: input.jobTitle,
        departmentId: input.departmentId,
        passwordHash: tempPasswordHash,
        status: 'INVITED',
        emailVerified: false,
      },
      select: userSelect,
    });
    void plant; // resolved for future plant-scoping; single-plant deployments need no explicit assignment here

    const rawToken = await createEmailToken(user.id, 'PASSWORD_RESET', parseDurationMs('72h'));
    const link = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;
    await sendMail({
      to: user.email,
      subject: "You've been invited to DigiLog",
      html: resetPasswordEmail(user.firstName, link).replace('Reset your password', 'Set up your account'),
      text: `Set up your DigiLog account: ${link}`,
    });

    await writeAudit({ actorId, action: 'CREATE', entityType: 'User', entityId: user.id });
    return user;
  },

  async update(actorId: string, id: string, input: UpdateUserInput) {
    if (id === actorId && input.role && input.role !== 'ADMIN') {
      throw ApiError.badRequest('You cannot demote your own account');
    }
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound('User not found');

    const user = await prisma.user.update({ where: { id }, data: input, select: userSelect });
    await writeAudit({ actorId, action: 'UPDATE', entityType: 'User', entityId: id, metadata: input });

    // Sensitive: granting admin, or any change to an existing admin's account — every other admin should know.
    const touchesAdminPower = input.role === 'ADMIN' || existing.role === 'ADMIN';
    if (touchesAdminPower && actorId !== id) {
      const actor = await prisma.user.findUnique({ where: { id: actorId }, select: { firstName: true, lastName: true } });
      await notifyOtherAdmins(
        actorId,
        'Admin account change',
        `${actor?.firstName} ${actor?.lastName} modified ${user.firstName} ${user.lastName}'s account (${Object.keys(input).join(', ')})`,
        `/admin?tab=activity`
      );
    }
    return user;
  },

  async deactivate(actorId: string, id: string) {
    if (id === actorId) throw ApiError.badRequest('You cannot deactivate your own account');
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound('User not found');
    await prisma.user.update({ where: { id }, data: { status: 'DEACTIVATED' } });
    await writeAudit({ actorId, action: 'UPDATE', entityType: 'User', entityId: id, metadata: { status: 'DEACTIVATED' } });

    const actor = await prisma.user.findUnique({ where: { id: actorId }, select: { firstName: true, lastName: true } });
    await notifyOtherAdmins(
      actorId,
      existing.role === 'ADMIN' ? 'Another admin was deactivated' : 'User deactivated',
      `${actor?.firstName} ${actor?.lastName} deactivated ${existing.firstName} ${existing.lastName}`,
      `/admin?tab=activity`
    );
  },
};

export const adminOrgService = {
  async listDepartments(plantId: string) {
    return prisma.department.findMany({ where: { plantId }, orderBy: { name: 'asc' }, include: { _count: { select: { users: true, machines: true } } } });
  },

  async createDepartment(actorId: string, plantId: string, input: CreateDepartmentInput) {
    const dept = await prisma.department.create({ data: { ...input, plantId } });
    await writeAudit({ actorId, action: 'CREATE', entityType: 'Department', entityId: dept.id });
    return dept;
  },

  async updateDepartment(actorId: string, id: string, input: UpdateDepartmentInput) {
    const dept = await prisma.department.update({ where: { id }, data: input });
    await writeAudit({ actorId, action: 'UPDATE', entityType: 'Department', entityId: id });
    return dept;
  },

  async removeDepartment(actorId: string, id: string) {
    const usersInDept = await prisma.user.count({ where: { departmentId: id } });
    if (usersInDept > 0) throw ApiError.badRequest('Reassign users out of this department before deleting it');
    await prisma.department.delete({ where: { id } });
    await writeAudit({ actorId, action: 'DELETE', entityType: 'Department', entityId: id });
  },

  async listMachines(plantId: string) {
    return prisma.machine.findMany({ where: { plantId }, orderBy: { name: 'asc' }, include: { department: { select: { name: true } } } });
  },

  async createMachine(actorId: string, plantId: string, input: CreateMachineInput) {
    const machine = await prisma.machine.create({ data: { ...input, plantId } });
    await writeAudit({ actorId, action: 'CREATE', entityType: 'Machine', entityId: machine.id });
    return machine;
  },

  async updateMachine(actorId: string, id: string, input: UpdateMachineInput) {
    const machine = await prisma.machine.update({ where: { id }, data: input });
    await writeAudit({ actorId, action: 'UPDATE', entityType: 'Machine', entityId: id });
    return machine;
  },

  async removeMachine(actorId: string, id: string) {
    await prisma.machine.delete({ where: { id } });
    await writeAudit({ actorId, action: 'DELETE', entityType: 'Machine', entityId: id });
  },

  async listPlants() {
    return prisma.plant.findMany({ orderBy: { name: 'asc' } });
  },

  async updatePlant(actorId: string, id: string, input: UpdatePlantInput) {
    const plant = await prisma.plant.update({ where: { id }, data: input });
    await writeAudit({ actorId, action: 'UPDATE', entityType: 'Plant', entityId: id });
    return plant;
  },
};
