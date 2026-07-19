import type { Prisma, UserRole } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import { writeAudit } from '../../services/audit.service';
import { storeFile } from '../../services/storage.service';
import { toCsv } from '../../utils/csv';
import type {
  CreateShiftLogInput,
  UpdateShiftLogInput,
  ListShiftLogsQuery,
} from './shift-log.validation';

const SIGNERS: UserRole[] = ['SUPERVISOR', 'MANAGER', 'ADMIN'];

const detailInclude = {
  author: { select: { id: true, firstName: true, lastName: true, jobTitle: true } },
  plant: { select: { id: true, name: true } },
  department: { select: { id: true, name: true, code: true } },
  attachments: { orderBy: { createdAt: 'desc' as const } },
} satisfies Prisma.ShiftLogInclude;

function assertEditable(status: string) {
  if (status === 'SIGNED' || status === 'ARCHIVED') {
    throw ApiError.forbidden('This shift log is signed and can no longer be edited');
  }
}

async function findOwned(id: string) {
  const log = await prisma.shiftLog.findUnique({ where: { id } });
  if (!log) throw ApiError.notFound('Shift log not found');
  return log;
}

function buildWhere(
  query: ListShiftLogsQuery,
  userId: string
): Prisma.ShiftLogWhereInput {
  const where: Prisma.ShiftLogWhereInput = {};
  if (query.status) where.status = query.status;
  if (query.shiftType) where.shiftType = query.shiftType;
  if (query.departmentId) where.departmentId = query.departmentId;
  if (query.mine) where.authorId = userId;
  if (query.from || query.to) {
    where.shiftDate = {
      ...(query.from ? { gte: query.from } : {}),
      ...(query.to ? { lte: query.to } : {}),
    };
  }
  if (query.search) {
    where.OR = [
      { code: { contains: query.search, mode: 'insensitive' } },
      { equipmentStatus: { contains: query.search, mode: 'insensitive' } },
      { productionNotes: { contains: query.search, mode: 'insensitive' } },
      { safetyNotes: { contains: query.search, mode: 'insensitive' } },
      { remarks: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  return where;
}

export const shiftLogService = {
  async create(userId: string, plantId: string, input: CreateShiftLogInput) {
    const log = await prisma.shiftLog.create({
      data: {
        authorId: userId,
        plantId,
        departmentId: input.departmentId,
        shiftType: input.shiftType,
        shiftDate: input.shiftDate,
        equipmentStatus: input.equipmentStatus,
        temperature: input.temperature,
        pressure: input.pressure,
        productionNotes: input.productionNotes,
        safetyNotes: input.safetyNotes,
        remarks: input.remarks,
        status: 'DRAFT',
      },
      include: detailInclude,
    });
    await writeAudit({
      actorId: userId,
      action: 'CREATE',
      entityType: 'ShiftLog',
      entityId: log.id,
    });
    return log;
  },

  async list(userId: string, query: ListShiftLogsQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy ?? 'shiftDate';
    const sortOrder = query.sortOrder ?? 'desc';

    const where = buildWhere(query, userId);

    const [items, total] = await Promise.all([
      prisma.shiftLog.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        include: {
          author: { select: { firstName: true, lastName: true } },
          plant: { select: { name: true } },
          department: { select: { name: true } },
          _count: { select: { attachments: true } },
        },
      }),
      prisma.shiftLog.count({ where }),
    ]);

    return { items, total, page, limit };
  },

  async getById(id: string) {
    const log = await prisma.shiftLog.findUnique({
      where: { id },
      include: detailInclude,
    });
    if (!log) throw ApiError.notFound('Shift log not found');
    return log;
  },

  async update(userId: string, role: UserRole, id: string, input: UpdateShiftLogInput) {
    const existing = await findOwned(id);
    if (existing.authorId !== userId && role !== 'ADMIN') {
      throw ApiError.forbidden('You can only edit your own shift logs');
    }
    assertEditable(existing.status);

    const log = await prisma.shiftLog.update({
      where: { id },
      data: input,
      include: detailInclude,
    });
    await writeAudit({
      actorId: userId,
      action: 'UPDATE',
      entityType: 'ShiftLog',
      entityId: id,
    });
    return log;
  },

  async remove(userId: string, role: UserRole, id: string) {
    const existing = await findOwned(id);
    if (existing.authorId !== userId && role !== 'ADMIN') {
      throw ApiError.forbidden('You can only delete your own shift logs');
    }
    if (existing.status === 'SIGNED' || existing.status === 'ARCHIVED') {
      throw ApiError.forbidden('Signed shift logs cannot be deleted');
    }
    await prisma.shiftLog.delete({ where: { id } });
    await writeAudit({
      actorId: userId,
      action: 'DELETE',
      entityType: 'ShiftLog',
      entityId: id,
    });
  },

  async submit(userId: string, id: string) {
    const existing = await findOwned(id);
    if (existing.authorId !== userId) {
      throw ApiError.forbidden('You can only submit your own shift logs');
    }
    if (existing.status !== 'DRAFT') {
      throw ApiError.badRequest('Only draft shift logs can be submitted');
    }
    const log = await prisma.shiftLog.update({
      where: { id },
      data: { status: 'SUBMITTED' },
      include: detailInclude,
    });
    await writeAudit({ actorId: userId, action: 'UPDATE', entityType: 'ShiftLog', entityId: id, metadata: { transition: 'SUBMITTED' } });
    return log;
  },

  async sign(userId: string, role: UserRole, id: string) {
    if (!SIGNERS.includes(role)) {
      throw ApiError.forbidden('Only a supervisor, manager, or admin can sign a shift log');
    }
    const existing = await findOwned(id);
    if (existing.status !== 'SUBMITTED') {
      throw ApiError.badRequest('Only submitted shift logs can be signed');
    }
    const log = await prisma.shiftLog.update({
      where: { id },
      data: { status: 'SIGNED', signedAt: new Date() },
      include: detailInclude,
    });
    await writeAudit({ actorId: userId, action: 'SIGN', entityType: 'ShiftLog', entityId: id });
    return log;
  },

  async addAttachment(
    userId: string,
    id: string,
    file: Express.Multer.File
  ) {
    const existing = await findOwned(id);
    assertEditable(existing.status);

    const stored = await storeFile(file.buffer, file.originalname, `shift-logs/${id}`);
    const attachment = await prisma.attachment.create({
      data: {
        fileName: file.originalname,
        url: stored.url,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        uploadedById: userId,
        shiftLogId: id,
      },
    });
    return attachment;
  },

  async removeAttachment(userId: string, role: UserRole, id: string, attachmentId: string) {
    const attachment = await prisma.attachment.findUnique({ where: { id: attachmentId } });
    if (!attachment || attachment.shiftLogId !== id) {
      throw ApiError.notFound('Attachment not found');
    }
    if (attachment.uploadedById !== userId && role !== 'ADMIN') {
      throw ApiError.forbidden('You can only remove attachments you uploaded');
    }
    await prisma.attachment.delete({ where: { id: attachmentId } });
  },

  async exportCsv(userId: string, query: ListShiftLogsQuery): Promise<string> {
    const where = buildWhere(query, userId);
    const rows = await prisma.shiftLog.findMany({
      where,
      orderBy: { shiftDate: 'desc' },
      take: 5000,
      include: {
        author: { select: { firstName: true, lastName: true } },
        plant: { select: { name: true } },
        department: { select: { name: true } },
      },
    });

    return toCsv(rows, [
      { header: 'Code', value: (r) => r.code },
      { header: 'Shift Date', value: (r) => r.shiftDate.toISOString().slice(0, 10) },
      { header: 'Shift Type', value: (r) => r.shiftType },
      { header: 'Status', value: (r) => r.status },
      { header: 'Author', value: (r) => `${r.author.firstName} ${r.author.lastName}` },
      { header: 'Plant', value: (r) => r.plant.name },
      { header: 'Department', value: (r) => r.department?.name },
      { header: 'Equipment Status', value: (r) => r.equipmentStatus },
      { header: 'Temperature', value: (r) => r.temperature },
      { header: 'Pressure', value: (r) => r.pressure },
      { header: 'Production Notes', value: (r) => r.productionNotes },
      { header: 'Safety Notes', value: (r) => r.safetyNotes },
      { header: 'Remarks', value: (r) => r.remarks },
      { header: 'Signed At', value: (r) => r.signedAt?.toISOString() },
    ]);
  },
};
