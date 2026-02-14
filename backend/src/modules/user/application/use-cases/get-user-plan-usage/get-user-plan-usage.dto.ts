export interface GetUserPlanUsageRequestDto {
  userId: string;
}

export interface GetUserPlanUsageResponseDto {
  plan: {
    id: string;
    code: string;
    name: string;
  };
  limits: {
    maxResumes: number;
    maxExports: number;
    dailyUploadMb: number;
    dailyUploadBytes: number;
    dailyExports: number;
    dailyExportEmails: number;
    dailyBulkApplies: number;
  };
  usage: {
    resumesUsed: number;
    exportsUsed: number;
    dailyExportsUsed: number;
    dailyUploadUsedBytes: number;
    dailyExportEmailsUsed: number;
    dailyBulkAppliesUsed: number;
  };
  remaining: {
    resumes: number;
    exports: number;
    dailyExports: number;
    dailyUploadBytes: number;
    dailyExportEmails: number;
    dailyBulkApplies: number;
  };
}
