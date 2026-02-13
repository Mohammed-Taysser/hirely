import { Prisma } from '@generated-prisma';

import prisma from '@/apps/prisma';
import {
  AuditLogInput,
  IAuditLogService,
} from '@/modules/audit/application/services/audit-log.service.interface';

export class PrismaAuditLogService implements IAuditLogService {
  async log(input: AuditLogInput): Promise<void> {
    const { action, actorUserId, entityType, entityId, metadata } = input;

    await prisma.auditLog.create({
      data: {
        action,
        actorUserId: actorUserId ?? null,
        entityType,
        entityId,
        metadata: (metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  }
}
