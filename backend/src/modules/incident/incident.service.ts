import type { Prisma, UserRole } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import { writeAudit } from '../../services/audit.service';
import { storeFile } from '../../services/storage.service';
import { notifyUser } from '../notifications/notifications.service';
import { sendMail, incidentEscalationEmail } from '../../services/mailer';
import { env } from '../../config/env';
import { orgService } from '../org/org.service';
import type { CreateIncidentInput, UpdateIncidentInput, ListIncidentsQuery, CreateCapaInput, UpdateCapaInput } from './incident.validation';

const SUPERVISORS: UserRole[] = ['SUPERVISOR', 'MANAGER', 'ADMIN'];
const REVIEW_STATUSES = new Set(['UNDER_REVIEW', 'RESOLVED', 'CLOSED']);

const detailInclude = {
  reporter: { select: { id: true, firstName: true, lastName: true, jobTitle: true } },
  assignee: { select: { id: true, firstName: true, lastName: true, jobTitle: true } },
  plant: { select: { id: true, name: true } },
  machine: { select: { id: true, name: true, tag: true } },
  event: { select: { id: true, title: true } },
  capas: {
    orderBy: { createdAt: 'desc' as const },
    include: { owner: { select: { id: true, firstName: true, lastName: true } } },
  },
  attachments: { orderBy: { createdAt: 'desc' as const } },
  _count: { select: { comments: true } },
} satisfies Prisma.IncidentInclude;

async function findOwned(id: string) {
  const incident = await prisma.incident.findUnique({ where: { id } });
  if (!incident) throw ApiError.notFound('Incident not found');
  return incident;
}

function buildWhere(query: ListIncidentsQuery, userId: string): Prisma.IncidentWhereInput {
  const where: Prisma.IncidentWhereInput = {};
  if (query.status) where.status = query.status;
  if (query.severity) where.severity = query.severity;
  if (query.mine) where.reporterId = userId;
  if (query.assignedToMe) where.assigneeId = userId;
  if (query.search) {
    where.OR = [
      { code: { contains: query.search, mode: 'insensitive' } },
      { title: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  return where;
}

export const incidentService = {
  async create(userId: string, input: CreateIncidentInput) {
    const { plant } = await orgService.getContextForUser(userId);
    const incident = await prisma.incident.create({
      data: {
        title: input.title,
        description: input.description,
        severity: input.severity,
        machineId: input.machineId,
        reporterId: userId,
        plantId: plant.id,
      },
      include: detailInclude,
    });
    await writeAudit({ actorId: userId, action: 'CREATE', entityType: 'Incident', entityId: incident.id });
    return incident;
  },

  async list(userId: string, query: ListIncidentsQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';
    const where = buildWhere(query, userId);

    const [items, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        include: {
          reporter: { select: { firstName: true, lastName: true } },
          assignee: { select: { firstName: true, lastName: true } },
          machine: { select: { name: true } },
          _count: { select: { comments: true, capas: true } },
        },
      }),
      prisma.incident.count({ where }),
    ]);
    return { items, total, page, limit };
  },

  async getById(id: string) {
    const incident = await prisma.incident.findUnique({ where: { id }, include: detailInclude });
    if (!incident) throw ApiError.notFound('Incident not found');
    return incident;
  },

  async update(userId: string, role: UserRole, id: string, input: UpdateIncidentInput) {
    const existing = await findOwned(id);
    const isParticipant = existing.reporterId === userId || existing.assigneeId === userId;
    if (!isParticipant && role !== 'ADMIN' && !SUPERVISORS.includes(role)) {
      throw ApiError.forbidden('You do not have access to edit this incident');
    }
    if (existing.status === 'CLOSED') {
      throw ApiError.forbidden('This incident is closed and can no longer be edited');
    }
    if (input.assigneeId !== undefined && !SUPERVISORS.includes(role)) {
      throw ApiError.forbidden('Only a supervisor, manager, or admin can assign an incident');
    }
    if (input.status && REVIEW_STATUSES.has(input.status) && !SUPERVISORS.includes(role)) {
      throw ApiError.forbidden('Only a supervisor, manager, or admin can move an incident to review, resolved, or closed');
    }

    const data: Prisma.IncidentUpdateInput = { ...input };
    if (input.assigneeId && existing.status === 'OPEN' && !input.status) {
      data.status = 'ASSIGNED';
    }
    if (input.status === 'RESOLVED') data.resolvedAt = new Date();

    const incident = await prisma.incident.update({ where: { id }, data, include: detailInclude });
    await writeAudit({ actorId: userId, action: 'UPDATE', entityType: 'Incident', entityId: id });
    return incident;
  },

  async remove(userId: string, role: UserRole, id: string) {
    const existing = await findOwned(id);
    if (existing.reporterId !== userId && role !== 'ADMIN') {
      throw ApiError.forbidden('You can only delete incidents you reported');
    }
    if (existing.status !== 'OPEN') {
      throw ApiError.forbidden('Incidents that are already being worked on cannot be deleted');
    }
    await prisma.incident.delete({ where: { id } });
    await writeAudit({ actorId: userId, action: 'DELETE', entityType: 'Incident', entityId: id });
  },

  async escalate(userId: string, role: UserRole, id: string) {
    if (!SUPERVISORS.includes(role)) {
      throw ApiError.forbidden('Only a supervisor, manager, or admin can escalate an incident');
    }
    const incident = await prisma.incident.update({
      where: { id },
      data: { escalated: true },
      include: detailInclude,
    });

    const managers = await prisma.user.findMany({
      where: { role: { in: ['MANAGER', 'ADMIN'] }, status: 'ACTIVE' },
      select: { id: true, email: true, firstName: true },
    });

    await Promise.all(
      managers.map(async (m) => {
        await notifyUser({
          userId: m.id,
          type: 'INCIDENT',
          title: `Incident escalated: ${incident.title}`,
          body: `Severity: ${incident.severity}`,
          link: `/incidents/${incident.id}`,
        });
        if (incident.severity === 'HIGH' || incident.severity === 'CRITICAL') {
          await sendMail({
            to: m.email,
            subject: `[DigiLog] Incident escalated — ${incident.severity}`,
            html: incidentEscalationEmail(
              m.firstName,
              incident.title,
              incident.severity,
              `${env.CLIENT_URL}/incidents/${incident.id}`
            ),
          });
        }
      })
    );

    await writeAudit({ actorId: userId, action: 'UPDATE', entityType: 'Incident', entityId: id, metadata: { escalated: true } });
    return incident;
  },

  async addAttachment(userId: string, id: string, file: Express.Multer.File) {
    const existing = await findOwned(id);
    if (existing.status === 'CLOSED') throw ApiError.forbidden('This incident is closed');
    const stored = await storeFile(file.buffer, file.originalname, `incidents/${id}`);
    return prisma.attachment.create({
      data: {
        fileName: file.originalname,
        url: stored.url,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        uploadedById: userId,
        incidentId: id,
      },
    });
  },

  async removeAttachment(userId: string, role: UserRole, id: string, attachmentId: string) {
    const attachment = await prisma.attachment.findUnique({ where: { id: attachmentId } });
    if (!attachment || attachment.incidentId !== id) throw ApiError.notFound('Attachment not found');
    if (attachment.uploadedById !== userId && role !== 'ADMIN') {
      throw ApiError.forbidden('You can only remove attachments you uploaded');
    }
    await prisma.attachment.delete({ where: { id: attachmentId } });
  },
};

export const capaService = {
  async create(userId: string, role: UserRole, incidentId: string, input: CreateCapaInput) {
    if (!SUPERVISORS.includes(role)) {
      throw ApiError.forbidden('Only a supervisor, manager, or admin can create a corrective/preventive action');
    }
    await findOwned(incidentId);
    const capa = await prisma.capa.create({
      data: {
        incidentId,
        type: input.type,
        action: input.action,
        ownerId: input.ownerId,
        dueDate: input.dueDate,
      },
    });
    if (input.ownerId) {
      await notifyUser({
        userId: input.ownerId,
        type: 'INCIDENT',
        title: 'A corrective action was assigned to you',
        body: input.action.slice(0, 140),
        link: `/incidents/${incidentId}`,
      });
    }
    await writeAudit({ actorId: userId, action: 'CREATE', entityType: 'Capa', entityId: capa.id });
    return capa;
  },

  async update(userId: string, role: UserRole, incidentId: string, capaId: string, input: UpdateCapaInput) {
    const capa = await prisma.capa.findUnique({ where: { id: capaId } });
    if (!capa || capa.incidentId !== incidentId) throw ApiError.notFound('Corrective action not found');

    const isOwner = capa.ownerId === userId;
    if (!isOwner && !SUPERVISORS.includes(role)) {
      throw ApiError.forbidden('Only the owner, a supervisor, manager, or admin can update this action');
    }
    if (input.status === 'VERIFIED' && !SUPERVISORS.includes(role)) {
      throw ApiError.forbidden('Only a supervisor, manager, or admin can verify a completed action');
    }

    const data: Prisma.CapaUpdateInput = { ...input };
    if (input.status === 'COMPLETED') data.completedAt = new Date();

    const updated = await prisma.capa.update({ where: { id: capaId }, data });
    await writeAudit({ actorId: userId, action: 'UPDATE', entityType: 'Capa', entityId: capaId });
    return updated;
  },

  async remove(role: UserRole, incidentId: string, capaId: string) {
    if (!SUPERVISORS.includes(role)) {
      throw ApiError.forbidden('Only a supervisor, manager, or admin can remove a corrective action');
    }
    const capa = await prisma.capa.findUnique({ where: { id: capaId } });
    if (!capa || capa.incidentId !== incidentId) throw ApiError.notFound('Corrective action not found');
    await prisma.capa.delete({ where: { id: capaId } });
  },
};
