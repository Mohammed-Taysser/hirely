export interface CreatePlanRequestDto {
  code: string;
  name: string;
  description?: string | null;
  limits: {
    create: {
      maxResumes: number;
      maxExports: number;
      dailyUploadMb: number;
      dailyExports: number;
      dailyExportEmails: number;
      dailyBulkApplies: number;
    };
  };
}

export interface UpdatePlanLimitsDto {
  update: {
    maxResumes?: number;
    maxExports?: number;
    dailyUploadMb?: number;
    dailyExports?: number;
    dailyExportEmails?: number;
    dailyBulkApplies?: number;
  };
}

export interface UpdatePlanDataDto {
  code?: string;
  name?: string;
  description?: string | null;
  limits?: UpdatePlanLimitsDto;
}
