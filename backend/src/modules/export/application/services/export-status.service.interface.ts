import { ExportStatus } from '@/modules/export/application/export-status';

export interface ExportStatusResult {
  id: string;
  status: ExportStatus;
  error: string | null;
  expiresAt: Date | null;
  downloadUrl: string | null;
}

export interface IExportStatusService {
  getExportStatus(userId: string, exportId: string): Promise<ExportStatusResult>;
}
