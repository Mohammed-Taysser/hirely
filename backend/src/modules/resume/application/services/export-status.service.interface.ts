import { ExportStatus } from '@/modules/resume/application/export-status';

export interface ExportStatusResult {
  id: string;
  status: ExportStatus;
  error: string | null;
  expiresAt: Date | null;
  downloadUrl: string | null;
}
