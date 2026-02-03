import { Prisma } from '@generated-prisma';

import prisma from '@/apps/prisma';
import {
  IResumeExportQueryRepository,
  ResumeExportDto,
} from '@/modules/resume/application/repositories/resume-export.query.repository.interface';

export class PrismaResumeExportQueryRepository implements IResumeExportQueryRepository {
  async getPaginatedExports(
    page: number,
    limit: number,
    filters: Prisma.ResumeExportWhereInput
  ): Promise<[ResumeExportDto[], number]> {
    const skip = (page - 1) * limit;

    return prisma.$transaction([
      prisma.resumeExport.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where: filters,
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
      prisma.resumeExport.count({ where: filters }),
    ]);
  }
}
