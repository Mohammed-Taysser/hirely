import { Prisma } from '@generated-prisma';

import prisma from '@/apps/prisma';
import {
  IResumeExportQueryRepository,
  ResumeExportDto,
  ResumeExportQueryFilters,
} from '@/modules/resume/application/repositories/resume-export.query.repository.interface';
import { toDateTimeFilter } from '@/modules/shared/infrastructure/prisma/filters';

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

    return prisma
      .$transaction([
        prisma.resumeExport.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          where,
          select: {
            id: true,
            snapshot: { select: { resumeId: true } },
            snapshotId: true,
            userId: true,
            idempotencyKey: true,
            status: true,
            url: true,
            sizeBytes: true,
            error: true,
            expiresAt: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.resumeExport.count({ where }),
      ])
      .then(([rows, total]) => [
        rows.map((row) => {
          const { snapshot, ...rest } = row;
          return {
            ...rest,
            resumeId: snapshot.resumeId,
          };
        }),
        total,
      ]);
  }

  async findById(userId: string, exportId: string): Promise<ResumeExportDto | null> {
    const row = await prisma.resumeExport.findFirst({
      where: { id: exportId, userId },
      select: {
        id: true,
        snapshot: { select: { resumeId: true } },
        snapshotId: true,
        userId: true,
        idempotencyKey: true,
        status: true,
        url: true,
        sizeBytes: true,
        error: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!row) {
      return null;
    }

    const { snapshot, ...rest } = row;
    return {
      ...rest,
      resumeId: snapshot.resumeId,
    };
  }

  async getFailedExportsByUser(
    userId: string,
    page: number,
    limit: number
  ): Promise<[ResumeExportDto[], number]> {
    const skip = (page - 1) * limit;
    const where: Prisma.ResumeExportWhereInput = {
      userId,
      status: 'FAILED',
    };

    return prisma
      .$transaction([
        prisma.resumeExport.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          where,
          select: {
            id: true,
            snapshot: { select: { resumeId: true } },
            snapshotId: true,
            userId: true,
            idempotencyKey: true,
            status: true,
            url: true,
            sizeBytes: true,
            error: true,
            expiresAt: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.resumeExport.count({ where }),
      ])
      .then(([rows, total]) => [
        rows.map((row) => {
          const { snapshot, ...rest } = row;
          return {
            ...rest,
            resumeId: snapshot.resumeId,
          };
        }),
        total,
      ]);
  }

  async findByIdForResume(
    userId: string,
    resumeId: string,
    exportId: string
  ): Promise<ResumeExportDto | null> {
    const row = await prisma.resumeExport.findFirst({
      where: { id: exportId, userId, snapshot: { resumeId } },
      select: {
        id: true,
        snapshot: { select: { resumeId: true } },
        snapshotId: true,
        userId: true,
        idempotencyKey: true,
        status: true,
        url: true,
        sizeBytes: true,
        error: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!row) {
      return null;
    }

    const { snapshot, ...rest } = row;
    return {
      ...rest,
      resumeId: snapshot.resumeId,
    };
  }

  async findByIdempotencyKey(
    userId: string,
    idempotencyKey: string
  ): Promise<ResumeExportDto | null> {
    const row = await prisma.resumeExport.findFirst({
      where: { userId, idempotencyKey },
      select: {
        id: true,
        snapshot: { select: { resumeId: true } },
        snapshotId: true,
        userId: true,
        idempotencyKey: true,
        status: true,
        url: true,
        sizeBytes: true,
        error: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!row) {
      return null;
    }

    const { snapshot, ...rest } = row;
    return {
      ...rest,
      resumeId: snapshot.resumeId,
    };
  }
}
