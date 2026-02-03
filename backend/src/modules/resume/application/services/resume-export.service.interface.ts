export interface ResumeExportResult {
  pdfBuffer: Buffer;
}

export interface IResumeExportService {
  generatePdfBuffer(userId: string, resumeId: string): Promise<ResumeExportResult>;
}
