export interface PlanLimitDto {
  id: string;
  maxResumes: number;
  maxExports: number;
  dailyUploadMb: number;
  dailyExports: number;
  dailyExportEmails: number;
  dailyBulkApplies: number;
  planId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanUsageLimits {
  maxResumes: number;
  maxExports: number;
  dailyUploadMb: number;
  dailyUploadBytes: number;
  dailyExports: number;
  dailyExportEmails: number;
  dailyBulkApplies: number;
}
