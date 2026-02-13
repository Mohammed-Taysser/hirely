import prisma from '@/apps/prisma';
import { IResumeExportRepository } from '@/modules/resume/application/repositories/resume-export.repository.interface';
import { ExportRecord } from '@/modules/resume/application/services/export.service.interface';

export class PrismaResumeExportRepository implements IResumeExportRepository {
  async create(userId: string, snapshotId: string): Promise<ExportRecord> {
    return prisma.resumeExport.create({
      data: {
        userId,
        snapshotId,
        status: 'PENDING',
      },
    });
  }

  async markReady(exportId: string, storageKey: string, expiresAt: Date): Promise<ExportRecord> {
    return prisma.resumeExport.update({
      where: { id: exportId },
      data: {
        url: storageKey,
        expiresAt,
        status: 'READY',
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
}
