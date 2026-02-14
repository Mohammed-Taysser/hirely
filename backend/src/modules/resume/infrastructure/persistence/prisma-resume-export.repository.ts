import { Prisma } from '@generated-prisma';

import prisma from '@/apps/prisma';
import { IResumeExportRepository } from '@/modules/resume/application/repositories/resume-export.repository.interface';
import { ExportRecord } from '@/modules/resume/application/services/export.service.interface';
import { ConflictError } from '@/modules/shared/application/app-error';

export class PrismaResumeExportRepository implements IResumeExportRepository {
  async create(
    userId: string,
    snapshotId: string,
    options?: { idempotencyKey?: string }
  ): Promise<ExportRecord> {
    try {
      return await prisma.resumeExport.create({
        data: {
          userId,
          snapshotId,
          idempotencyKey: options?.idempotencyKey,
          status: 'PENDING',
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002' &&
        Array.isArray(error.meta?.target) &&
        error.meta.target.includes('userId') &&
        error.meta.target.includes('idempotencyKey')
      ) {
        throw new ConflictError('Idempotency key already used');
      }
      throw error;
    }
  }

  async markReady(
    exportId: string,
    storageKey: string,
    sizeBytes: number,
    expiresAt: Date
  ): Promise<ExportRecord> {
    return prisma.resumeExport.update({
      where: { id: exportId },
      data: {
        url: storageKey,
        sizeBytes,
        expiresAt,
        status: 'READY',
        error: null,
      },
    });
  }

  async markPending(exportId: string): Promise<ExportRecord> {
    return prisma.resumeExport.update({
      where: { id: exportId },
      data: {
        status: 'PENDING',
        error: null,
      },
    });
  }

  async markFailed(exportId: string, reason: string): Promise<ExportRecord> {
    return prisma.resumeExport.update({
      where: { id: exportId },
      data: {
        status: 'FAILED',
        error: reason,
      },
    });
  }

  async countByUser(userId: string): Promise<number> {
    return prisma.resumeExport.count({ where: { userId } });
  }

  async getUploadedBytesByUserInRange(userId: string, start: Date, end: Date): Promise<number> {
    const result = await prisma.resumeExport.aggregate({
      where: {
        userId,
        status: 'READY',
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      _sum: {
        sizeBytes: true,
      },
    });

    return result._sum.sizeBytes ?? 0;
  }

  async findExpired(now: Date, limit: number) {
    return prisma.resumeExport.findMany({
      where: {
        status: 'READY',
        expiresAt: {
          lte: now,
        },
      },
      orderBy: { expiresAt: 'asc' },
      take: limit,
      select: {
        id: true,
        userId: true,
        url: true,
        expiresAt: true,
      },
    });
  }

  async deleteByIds(ids: string[]): Promise<number> {
    if (ids.length === 0) {
      return 0;
    }

    const result = await prisma.resumeExport.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return result.count;
  }
}
