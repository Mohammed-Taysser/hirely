export interface EvaluateExportFailureAlertsRequestDto {
  now?: Date;
}

export interface ExportFailureAlertChannelResult {
  total: number;
  failed: number;
  failureRatio: number;
  thresholdExceeded: boolean;
  triggered: boolean;
  suppressedByCooldown: boolean;
}

export interface EvaluateExportFailureAlertsResponseDto {
  windowMinutes: number;
  minEvents: number;
  thresholdRatio: number;
  cooldownSeconds: number;
  pdf: ExportFailureAlertChannelResult;
  email: ExportFailureAlertChannelResult;
}
