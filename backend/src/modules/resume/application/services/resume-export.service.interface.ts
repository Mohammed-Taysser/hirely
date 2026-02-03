export interface ResumeExportResult {
  pdfBuffer: Buffer;
}

export interface ResumeExportStatusResult {
  id: string;
  status: string;
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
