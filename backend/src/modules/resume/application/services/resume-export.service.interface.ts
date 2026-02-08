import { ExportStatus } from '@/modules/export/application/export-status';

export interface ResumeExportResult {
  pdfBuffer: Buffer;
}

export interface ResumeExportStatusResult {
  id: string;
  status: ExportStatus;
  error: string | null;
  expiresAt: Date | null;
  downloadUrl: string | null;
}

export interface IResumeExportService {
  generatePdfBuffer(userId: string, resumeId: string): Promise<ResumeExportResult>;
  getExportStatusForResume(
    userId: string,
    resumeId: string,
    exportId: string
  ): Promise<ResumeExportStatusResult>;
}
