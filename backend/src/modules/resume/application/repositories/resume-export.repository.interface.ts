import { ExportRecord } from '@/modules/resume/application/services/export.service.interface';

export interface IResumeExportRepository {
  create(userId: string, snapshotId: string): Promise<ExportRecord>;
  markReady(exportId: string, storageKey: string, expiresAt: Date): Promise<ExportRecord>;
  markFailed(exportId: string, reason: string): Promise<ExportRecord>;
  countByUser(userId: string): Promise<number>;
}
