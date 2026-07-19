import type { AuditAction, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { logger } from '../config/logger';

interface AuditInput {
  actorId?: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
}

/**
 * Append an immutable audit-trail record. Never throws into the caller —
 * audit failures are logged but must not break the primary operation.
 */
export async function writeAudit(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        metadata: input.metadata,
        ipAddress: input.ipAddress ?? null,
      },
    });
  } catch (err) {
    logger.warn(
      `Failed to write audit log (${input.action} ${input.entityType}): ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
}
