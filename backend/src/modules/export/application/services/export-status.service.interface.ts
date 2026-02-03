export interface ExportStatusResult {
  id: string;
  status: string;
  error: string | null;
  expiresAt: Date | null;
  downloadUrl: string | null;
}

export interface IExportStatusService {
  getExportStatus(userId: string, exportId: string): Promise<ExportStatusResult>;
}
