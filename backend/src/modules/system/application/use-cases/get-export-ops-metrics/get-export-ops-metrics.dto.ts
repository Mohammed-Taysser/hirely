export interface GetExportOpsMetricsRequestDto {
  hours: number;
}

export interface GetExportOpsMetricsResponseDto {
  timeframeHours: number;
  since: string;
  counters: {
    pdfProcessed: number;
    pdfFailed: number;
    emailSent: number;
    emailFailed: number;
    cleanupCompleted: number;
    cleanupFailed: number;
  };
}
