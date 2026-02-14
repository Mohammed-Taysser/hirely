import { ExportStatus } from '@/modules/resume/application/export-status';
import { ExportStatusResult } from '@/modules/resume/application/services/export-status.service.interface';
import { ResumeExportResult } from '@/modules/resume/application/services/resume-export.service.interface';

export interface ExportRecord {
  id: string;
  snapshotId: string;
  userId: string;
  status: ExportStatus;
  url: string | null;
  sizeBytes: number | null;
  error: string | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExportService {
  createExportRecord(userId: string, snapshotId: string): Promise<ExportRecord>;
  markReady(
    exportId: string,
    storageKey: string,
    sizeBytes: number,
    planCode: string
  ): Promise<ExportRecord>;
  markFailed(exportId: string, reason: string): Promise<ExportRecord>;
  enforceExportLimit(userId: string, planId: string): Promise<void>;
  getExportStatus(userId: string, exportId: string): Promise<ExportStatusResult>;
  getExportStatusForResume(
    userId: string,
    resumeId: string,
    exportId: string
  ): Promise<ExportStatusResult>;
  generatePdfBuffer(userId: string, resumeId: string): Promise<ResumeExportResult>;
  processPdfExport(input: { exportId: string; snapshotId: string; userId: string }): Promise<void>;
  generateAndStoreExport(
    userId: string,
    resumeId: string
  ): Promise<{ exportRecordId: string; pdfBuffer: Buffer; storageKey: string }>;
}
