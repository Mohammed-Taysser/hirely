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
  };
  usage: {
    resumesUsed: number;
    exportsUsed: number;
    dailyUploadUsedBytes: number;
  };
  remaining: {
    resumes: number;
    exports: number;
    dailyUploadBytes: number;
  };
}
