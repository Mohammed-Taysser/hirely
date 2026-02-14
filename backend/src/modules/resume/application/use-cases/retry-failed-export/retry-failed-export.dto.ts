import { ExportStatus } from '@/modules/resume/application/export-status';

export interface RetryFailedExportRequestDto {
  userId: string;
  exportId: string;
}

export interface RetryFailedExportResponseDto {
  exportId: string;
  status: ExportStatus;
}
