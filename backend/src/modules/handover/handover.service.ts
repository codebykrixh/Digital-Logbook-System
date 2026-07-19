import type { Prisma, ShiftType } from '@prisma/client';
import PDFDocument from 'pdfkit';
import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import { writeAudit } from '../../services/audit.service';
import { notifyUser } from '../notifications/notifications.service';
import { toCsv } from '../../utils/csv';
import type { CreateHandoverInput, UpdateHandoverInput, ListHandoversQuery } from './handover.validation';

const detailInclude = {
  fromUser: { select: { id: true, firstName: true, lastName: true, jobTitle: true } },
  toUser: { select: { id: true, firstName: true, lastName: true, jobTitle: true } },
} satisfies Prisma.ShiftHandoverInclude;

async function findOwned(id: string) {
  const handover = await prisma.shiftHandover.findUnique({ where: { id } });
  if (!handover) throw ApiError.notFound('Handover not found');
  return handover;
}

/** Pulls the outgoing operator's shift logs and open incidents into a starting-point summary. */
async function generateSummary(userId: string, shiftDate: Date, shiftType: ShiftType): Promise<string> {
  const dayStart = new Date(shiftDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(shiftDate);
  dayEnd.setHours(23, 59, 59, 999);

  const [shiftLogs, openIncidents] = await Promise.all([
    prisma.shiftLog.findMany({
      where: { authorId: userId, shiftType, shiftDate: { gte: dayStart, lte: dayEnd } },
      select: { equipmentStatus: true, productionNotes: true, status: true },
    }),
    prisma.incident.findMany({
      where: { OR: [{ reporterId: userId }, { assigneeId: userId }], status: { notIn: ['RESOLVED', 'CLOSED'] } },
      select: { code: true, title: true, severity: true, status: true },
    }),
  ]);

  const lines: string[] = [];
  if (shiftLogs.length) {
    lines.push(`Shift logs this shift (${shiftLogs.length}):`);
    shiftLogs.forEach((l) => lines.push(`- ${l.equipmentStatus ?? l.productionNotes ?? 'Logged, no notes'} [${l.status}]`));
  } else {
    lines.push('No shift logs recorded for this shift.');
  }
  if (openIncidents.length) {
    lines.push('', `Open incidents to hand off (${openIncidents.length}):`);
    openIncidents.forEach((i) => lines.push(`- [${i.severity}] ${i.code}: ${i.title} (${i.status})`));
  }
  return lines.join('\n');
}

export const handoverService = {
  async create(userId: string, input: CreateHandoverInput) {
    const summary = await generateSummary(userId, input.shiftDate, input.shiftType);
    const handover = await prisma.shiftHandover.create({
      data: {
        fromUserId: userId,
        toUserId: input.toUserId,
        shiftType: input.shiftType,
        shiftDate: input.shiftDate,
        summary,
      },
      include: detailInclude,
    });
    await writeAudit({ actorId: userId, action: 'CREATE', entityType: 'ShiftHandover', entityId: handover.id });
    return handover;
  },

  async regenerateSummary(userId: string, id: string) {
    const existing = await findOwned(id);
    if (existing.fromUserId !== userId) throw ApiError.forbidden('You can only regenerate your own handover summary');
    if (existing.status !== 'DRAFT') throw ApiError.forbidden('Only a draft handover can be regenerated');
    const summary = await generateSummary(userId, existing.shiftDate, existing.shiftType);
    return prisma.shiftHandover.update({ where: { id }, data: { summary }, include: detailInclude });
  },

  async list(userId: string, query: ListHandoversQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.ShiftHandoverWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.mine) where.fromUserId = userId;
    if (query.forMe) where.toUserId = userId;

    const [items, total] = await Promise.all([
      prisma.shiftHandover.findMany({
        where,
        orderBy: { shiftDate: 'desc' },
        skip,
        take: limit,
        include: {
          fromUser: { select: { firstName: true, lastName: true } },
          toUser: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.shiftHandover.count({ where }),
    ]);
    return { items, total, page, limit };
  },

  async getById(id: string) {
    const handover = await prisma.shiftHandover.findUnique({ where: { id }, include: detailInclude });
    if (!handover) throw ApiError.notFound('Handover not found');
    return handover;
  },

  async update(userId: string, role: string, id: string, input: UpdateHandoverInput) {
    const existing = await findOwned(id);
    if (existing.fromUserId !== userId && role !== 'ADMIN') {
      throw ApiError.forbidden('You can only edit your own handover');
    }
    if (existing.status !== 'DRAFT') {
      throw ApiError.forbidden('A signed handover can no longer be edited');
    }
    const handover = await prisma.shiftHandover.update({
      where: { id },
      data: { ...input, checklist: input.checklist },
      include: detailInclude,
    });
    await writeAudit({ actorId: userId, action: 'UPDATE', entityType: 'ShiftHandover', entityId: id });
    return handover;
  },

  async remove(userId: string, role: string, id: string) {
    const existing = await findOwned(id);
    if (existing.fromUserId !== userId && role !== 'ADMIN') {
      throw ApiError.forbidden('You can only delete your own handover');
    }
    if (existing.status !== 'DRAFT') throw ApiError.forbidden('A signed handover can no longer be deleted');
    await prisma.shiftHandover.delete({ where: { id } });
    await writeAudit({ actorId: userId, action: 'DELETE', entityType: 'ShiftHandover', entityId: id });
  },

  async sign(userId: string, id: string, signatureData: string) {
    const existing = await findOwned(id);
    if (existing.fromUserId !== userId) throw ApiError.forbidden('Only the outgoing operator can sign this handover');
    if (existing.status !== 'DRAFT') throw ApiError.badRequest('This handover has already been signed');
    if (!existing.toUserId) throw ApiError.badRequest('Select who this shift is being handed over to before signing');

    const handover = await prisma.shiftHandover.update({
      where: { id },
      data: { status: 'PENDING_ACK', signatureData, signedAt: new Date() },
      include: detailInclude,
    });
    await notifyUser({
      userId: existing.toUserId,
      type: 'INFO',
      title: `${handover.fromUser.firstName} ${handover.fromUser.lastName} handed off a shift to you`,
      link: `/handover/${id}`,
    });
    await writeAudit({ actorId: userId, action: 'SIGN', entityType: 'ShiftHandover', entityId: id });
    return handover;
  },

  async acknowledge(userId: string, id: string) {
    const existing = await findOwned(id);
    if (existing.toUserId !== userId) throw ApiError.forbidden('Only the receiving operator can acknowledge this handover');
    if (existing.status !== 'PENDING_ACK') throw ApiError.badRequest('This handover is not awaiting acknowledgement');

    const handover = await prisma.shiftHandover.update({
      where: { id },
      data: { status: 'ACKNOWLEDGED', acknowledgedAt: new Date() },
      include: detailInclude,
    });
    await writeAudit({ actorId: userId, action: 'UPDATE', entityType: 'ShiftHandover', entityId: id, metadata: { acknowledged: true } });
    return handover;
  },

  async exportCsv(userId: string, query: ListHandoversQuery): Promise<string> {
    const where: Prisma.ShiftHandoverWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.mine) where.fromUserId = userId;
    const rows = await prisma.shiftHandover.findMany({
      where,
      orderBy: { shiftDate: 'desc' },
      take: 5000,
      include: {
        fromUser: { select: { firstName: true, lastName: true } },
        toUser: { select: { firstName: true, lastName: true } },
      },
    });
    return toCsv(rows, [
      { header: 'Code', value: (r) => r.code },
      { header: 'Shift Date', value: (r) => r.shiftDate.toISOString().slice(0, 10) },
      { header: 'Shift Type', value: (r) => r.shiftType },
      { header: 'Status', value: (r) => r.status },
      { header: 'From', value: (r) => `${r.fromUser.firstName} ${r.fromUser.lastName}` },
      { header: 'To', value: (r) => (r.toUser ? `${r.toUser.firstName} ${r.toUser.lastName}` : '') },
      { header: 'Signed At', value: (r) => r.signedAt?.toISOString() },
      { header: 'Acknowledged At', value: (r) => r.acknowledgedAt?.toISOString() },
    ]);
  },

  async generatePdf(id: string): Promise<Buffer> {
    const handover = await prisma.shiftHandover.findUnique({ where: { id }, include: detailInclude });
    if (!handover) throw ApiError.notFound('Handover not found');

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(20).text('DigiLog — Shift Handover', { align: 'left' });
      doc.fontSize(10).fillColor('#666').text(handover.code, { align: 'left' });
      doc.moveDown(1.5);

      doc.fontSize(12).fillColor('#000');
      doc.text(`Shift: ${handover.shiftType} · ${handover.shiftDate.toDateString()}`);
      doc.text(`From: ${handover.fromUser.firstName} ${handover.fromUser.lastName}`);
      doc.text(`To: ${handover.toUser ? `${handover.toUser.firstName} ${handover.toUser.lastName}` : 'Unassigned'}`);
      doc.text(`Status: ${handover.status}`);
      doc.moveDown();

      doc.fontSize(14).text('Summary');
      doc.fontSize(11).fillColor('#333').text(handover.summary ?? 'No summary provided.');
      doc.moveDown();

      if (handover.pendingWork) {
        doc.fontSize(14).fillColor('#000').text('Pending Work');
        doc.fontSize(11).fillColor('#333').text(handover.pendingWork);
        doc.moveDown();
      }

      const checklist = Array.isArray(handover.checklist) ? (handover.checklist as { label: string; done: boolean }[]) : [];
      if (checklist.length) {
        doc.fontSize(14).fillColor('#000').text('Checklist');
        checklist.forEach((item) => {
          doc.fontSize(11).fillColor('#333').text(`${item.done ? '[x]' : '[ ]'} ${item.label}`);
        });
        doc.moveDown();
      }

      if (handover.supervisorNote) {
        doc.fontSize(14).fillColor('#000').text('Supervisor Note');
        doc.fontSize(11).fillColor('#333').text(handover.supervisorNote);
        doc.moveDown();
      }

      if (handover.signatureData?.startsWith('data:image')) {
        doc.fontSize(14).fillColor('#000').text('Signature');
        try {
          const base64 = handover.signatureData.split(',')[1];
          if (base64) doc.image(Buffer.from(base64, 'base64'), { width: 200 });
        } catch {
          doc.fontSize(10).fillColor('#999').text('(signature could not be rendered)');
        }
        doc.fontSize(9).fillColor('#999').text(`Signed ${handover.signedAt?.toISOString() ?? ''}`);
      }

      doc.end();
    });
  },
};
