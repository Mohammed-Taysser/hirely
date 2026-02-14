import prisma from '@/apps/prisma';
import {
  FailedExportEmailJobDto,
  FailedExportEmailJobQuery,
  ISystemLogQueryRepository,
} from '@/modules/system/application/repositories/system-log.query.repository.interface';
import { SystemActions } from '@/modules/system/application/system.actions';

const toRecordOrNull = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
};

export class PrismaSystemLogQueryRepository implements ISystemLogQueryRepository {
  async getActionCounts(actions: string[], since?: Date): Promise<Record<string, number>> {
    if (actions.length === 0) {
      return {};
    }

    const grouped = await prisma.systemLog.groupBy({
      by: ['action'],
      where: {
        action: { in: actions },
        ...(since
          ? {
              createdAt: {
                gte: since,
              },
            }
          : {}),
      },
      _count: {
        _all: true,
      },
    });

    const countMap = actions.reduce<Record<string, number>>((acc, action) => {
      acc[action] = 0;
      return acc;
    }, {});

    for (const item of grouped) {
      countMap[item.action] = item._count._all;
    }

    return countMap;
  }

  async hasActionSince(action: string, since: Date): Promise<boolean> {
    const latest = await prisma.systemLog.findFirst({
      where: {
        action,
        createdAt: {
          gte: since,
        },
      },
      select: { id: true },
    });

    return Boolean(latest);
  }

  async countByUserAndActionInRange(
    userId: string,
    action: string,
    start: Date,
    end: Date
  ): Promise<number> {
    return prisma.systemLog.count({
      where: {
        userId,
        action,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });
  }

  async getActionCountsByReason(
    actions: string[],
    reasons: string[],
    since?: Date
  ): Promise<Record<string, Record<string, number>>> {
    if (actions.length === 0 || reasons.length === 0) {
      return {};
    }

    const countMap = actions.reduce<Record<string, Record<string, number>>>((acc, action) => {
      acc[action] = reasons.reduce<Record<string, number>>((reasonAcc, reason) => {
        reasonAcc[reason] = 0;
        return reasonAcc;
      }, {});
      return acc;
    }, {});

    for (const action of actions) {
      for (const reason of reasons) {
        countMap[action][reason] = await prisma.systemLog.count({
          where: {
            action,
            ...(since
              ? {
                  createdAt: {
                    gte: since,
                  },
                }
              : {}),
            metadata: {
              path: ['reason'],
              equals: reason,
            },
          },
        });
      }
    }

    return countMap;
  }

  async findFailedExportEmailJobs(
    query: FailedExportEmailJobQuery
  ): Promise<{ jobs: FailedExportEmailJobDto[]; total: number }> {
    const skip = (query.page - 1) * query.limit;
    const where = {
      userId: query.userId,
      action: {
        in: [SystemActions.EXPORT_EMAIL_FAILED, SystemActions.WORKER_EMAIL_FAILED],
      },
    };

    const [rows, total] = await prisma.$transaction([
      prisma.systemLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
        select: {
          id: true,
          action: true,
          message: true,
          metadata: true,
          createdAt: true,
        },
      }),
      prisma.systemLog.count({ where }),
    ]);

    return {
      jobs: rows.map((row) => ({
        id: row.id,
        action: row.action,
        message: row.message,
        metadata: toRecordOrNull(row.metadata),
        createdAt: row.createdAt,
      })),
      total,
    };
  }

  async findFailedExportEmailJobById(
    userId: string,
    logId: string
  ): Promise<FailedExportEmailJobDto | null> {
    const row = await prisma.systemLog.findFirst({
      where: {
        id: logId,
        userId,
        action: {
          in: [SystemActions.EXPORT_EMAIL_FAILED, SystemActions.WORKER_EMAIL_FAILED],
        },
      },
      select: {
        id: true,
        action: true,
        message: true,
        metadata: true,
        createdAt: true,
      },
    });

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      action: row.action,
      message: row.message,
      metadata: toRecordOrNull(row.metadata),
      createdAt: row.createdAt,
    };
  }
}
