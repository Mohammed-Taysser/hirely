import prisma from '@/apps/prisma';
import { AuditEntityType } from '@/modules/audit/application/audit.entity';
import {
  AuditLogListResult,
  IAuditLogQueryRepository,
} from '@/modules/audit/application/repositories/audit-log.query.repository.interface';

const buildWhereClause = (entityType: AuditEntityType, entityId: string) => ({
  entityType,
  entityId,
});

export class PrismaAuditLogQueryRepository implements IAuditLogQueryRepository {
  async findByEntity(input: {
    entityType: AuditEntityType;
    entityId: string;
    page: number;
    limit: number;
  }): Promise<AuditLogListResult> {
    const { entityType, entityId, page, limit } = input;
    const where = buildWhereClause(entityType, entityId);
    const skip = (page - 1) * limit;

    const [total, logs] = await prisma.$transaction([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      total,
      logs: logs.map((log) => ({
        id: log.id,
        action: log.action,
        actorUserId: log.actorUserId,
        entityType: log.entityType as AuditEntityType,
        entityId: log.entityId,
        metadata: (log.metadata as Record<string, unknown> | null) ?? null,
        createdAt: log.createdAt,
      })),
    };
  }
}
