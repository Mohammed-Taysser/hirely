import { Prisma } from '@generated-prisma';

import prisma from '@/apps/prisma';
import {
  IResumeExportQueryRepository,
  ResumeExportDto,
  ResumeExportQueryFilters,
} from '@/modules/resume/application/repositories/resume-export.query.repository.interface';
import { toDateTimeFilter } from '@/modules/shared/infra/prisma/filters';

const buildResumeExportFilters = (
  filters: ResumeExportQueryFilters
): Prisma.ResumeExportWhereInput => {
  const where: Prisma.ResumeExportWhereInput = {
    userId: filters.userId,
    snapshot: { resumeId: filters.resumeId },
  };

  if (filters.status) {
    where.status = filters.status;
  }

  const createdAt = toDateTimeFilter(filters.createdAt);
  if (createdAt) {
    where.createdAt = createdAt;
  }

  return where;
};

export class PrismaResumeExportQueryRepository implements IResumeExportQueryRepository {
  async getPaginatedExports(
    page: number,
    limit: number,
    filters: ResumeExportQueryFilters
  ): Promise<[ResumeExportDto[], number]> {
    const skip = (page - 1) * limit;
    const where = buildResumeExportFilters(filters);

    return prisma.$transaction([
      prisma.resumeExport.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where,
        select: {
          id: true,
          snapshotId: true,
          userId: true,
          status: true,
          url: true,
          error: true,
          expiresAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.resumeExport.count({ where }),
    ]);
  }
}
