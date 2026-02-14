export interface RetryFailedExportEmailJobRequestDto {
  userId: string;
  failedJobId: string;
}

export interface RetryFailedExportEmailJobResponseDto {
  failedJobId: string;
  exportId: string;
  to: string;
  reason: 'free-tier-export' | 'bulk-apply';
}
