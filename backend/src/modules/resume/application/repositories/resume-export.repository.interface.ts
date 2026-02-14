import { ExportRecord } from '@/modules/resume/application/services/export.service.interface';

export interface ExpiredResumeExportRecord {
  id: string;
  userId: string;
  url: string | null;
  expiresAt: Date | null;
}

export interface IResumeExportRepository {
  create(
    userId: string,
    snapshotId: string,
    options?: { idempotencyKey?: string }
  ): Promise<ExportRecord>;
  markReady(
    exportId: string,
    storageKey: string,
    sizeBytes: number,
    expiresAt: Date
  ): Promise<ExportRecord>;
  markPending(exportId: string): Promise<ExportRecord>;
  markFailed(exportId: string, reason: string): Promise<ExportRecord>;
  countByUser(userId: string): Promise<number>;
  getUploadedBytesByUserInRange(userId: string, start: Date, end: Date): Promise<number>;
  findExpired(now: Date, limit: number): Promise<ExpiredResumeExportRecord[]>;
  deleteByIds(ids: string[]): Promise<number>;
}
