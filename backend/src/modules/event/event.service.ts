import type { Prisma, UserRole } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import { writeAudit } from '../../services/audit.service';
import { storeFile } from '../../services/storage.service';
import type { CreateEventInput, UpdateEventInput, ListEventsQuery } from './event.validation';

const ESCALATORS: UserRole[] = ['SUPERVISOR', 'MANAGER', 'ADMIN'];
const CLOSING_STATUSES = new Set(['RESOLVED', 'CLOSED']);

const detailInclude = {
  creator: { select: { id: true, firstName: true, lastName: true, jobTitle: true } },
  machine: { select: { id: true, name: true, tag: true } },
  attachments: { orderBy: { createdAt: 'desc' as const } },
  incident: { select: { id: true, code: true, status: true } },
  _count: { select: { comments: true } },
} satisfies Prisma.OperationalEventInclude;

async function findOwned(id: string) {
  const event = await prisma.operationalEvent.findUnique({ where: { id } });
  if (!event) throw ApiError.notFound('Event not found');
  return event;
}

function buildWhere(query: ListEventsQuery, userId: string): Prisma.OperationalEventWhereInput {
  const where: Prisma.OperationalEventWhereInput = {};
  if (query.status) where.status = query.status;
  if (query.priority) where.priority = query.priority;
  if (query.machineId) where.machineId = query.machineId;
  if (query.mine) where.creatorId = userId;
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  return where;
}

export const eventService = {
  async create(userId: string, input: CreateEventInput) {
    const event = await prisma.operationalEvent.create({
      data: {
        title: input.title,
        description: input.description,
        priority: input.priority,
        machineId: input.machineId,
        occurredAt: input.occurredAt,
        creatorId: userId,
      },
      include: detailInclude,
    });
    await writeAudit({ actorId: userId, action: 'CREATE', entityType: 'OperationalEvent', entityId: event.id });
    return event;
  },

  async list(userId: string, query: ListEventsQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy ?? 'occurredAt';
    const sortOrder = query.sortOrder ?? 'desc';
    const where = buildWhere(query, userId);

    const [items, total] = await Promise.all([
      prisma.operationalEvent.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        include: {
          creator: { select: { firstName: true, lastName: true } },
          machine: { select: { name: true } },
          _count: { select: { comments: true, attachments: true } },
        },
      }),
      prisma.operationalEvent.count({ where }),
    ]);
    return { items, total, page, limit };
  },

  async getById(id: string) {
    const event = await prisma.operationalEvent.findUnique({ where: { id }, include: detailInclude });
    if (!event) throw ApiError.notFound('Event not found');
    return event;
  },

  async update(userId: string, role: UserRole, id: string, input: UpdateEventInput) {
    const existing = await findOwned(id);
    if (existing.creatorId !== userId && role !== 'ADMIN') {
      throw ApiError.forbidden('You can only edit events you created');
    }
    if (existing.status === 'CLOSED') {
      throw ApiError.forbidden('This event is closed and can no longer be edited');
    }
    if (input.status && CLOSING_STATUSES.has(input.status) && !ESCALATORS.includes(role)) {
      throw ApiError.forbidden('Only a supervisor, manager, or admin can resolve or close an event');
    }

    const event = await prisma.operationalEvent.update({ where: { id }, data: input, include: detailInclude });
    await writeAudit({ actorId: userId, action: 'UPDATE', entityType: 'OperationalEvent', entityId: id });
    return event;
  },

  async remove(userId: string, role: UserRole, id: string) {
    const existing = await findOwned(id);
    if (existing.creatorId !== userId && role !== 'ADMIN') {
      throw ApiError.forbidden('You can only delete events you created');
    }
    if (existing.status === 'CLOSED') {
      throw ApiError.forbidden('Closed events cannot be deleted');
    }
    await prisma.operationalEvent.delete({ where: { id } });
    await writeAudit({ actorId: userId, action: 'DELETE', entityType: 'OperationalEvent', entityId: id });
  },

  async escalate(userId: string, role: UserRole, id: string) {
    if (!ESCALATORS.includes(role)) {
      throw ApiError.forbidden('Only a supervisor, manager, or admin can escalate an event to an incident');
    }
    const event = await prisma.operationalEvent.findUnique({ where: { id }, include: { incident: true } });
    if (!event) throw ApiError.notFound('Event not found');
    if (event.incident) throw ApiError.badRequest('This event has already been escalated to an incident');

    const incident = await prisma.incident.create({
      data: {
        title: event.title,
        description: event.description,
        reporterId: userId,
        machineId: event.machineId,
        eventId: event.id,
      },
    });
    await writeAudit({
      actorId: userId,
      action: 'UPDATE',
      entityType: 'OperationalEvent',
      entityId: id,
      metadata: { escalatedToIncidentId: incident.id },
    });
    return incident;
  },

  async addAttachment(userId: string, id: string, file: Express.Multer.File) {
    const existing = await findOwned(id);
    if (existing.status === 'CLOSED') throw ApiError.forbidden('This event is closed');

    const stored = await storeFile(file.buffer, file.originalname, `events/${id}`);
    return prisma.attachment.create({
      data: {
        fileName: file.originalname,
        url: stored.url,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        uploadedById: userId,
        eventId: id,
      },
    });
  },

  async removeAttachment(userId: string, role: UserRole, id: string, attachmentId: string) {
    const attachment = await prisma.attachment.findUnique({ where: { id: attachmentId } });
    if (!attachment || attachment.eventId !== id) throw ApiError.notFound('Attachment not found');
    if (attachment.uploadedById !== userId && role !== 'ADMIN') {
      throw ApiError.forbidden('You can only remove attachments you uploaded');
    }
    await prisma.attachment.delete({ where: { id: attachmentId } });
  },
};
