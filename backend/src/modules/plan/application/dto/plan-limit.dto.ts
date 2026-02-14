export interface PlanLimitDto {
  id: string;
  maxResumes: number;
  maxExports: number;
  dailyUploadMb: number;
  planId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanUsageLimits {
  maxResumes: number;
  maxExports: number;
  dailyUploadMb: number;
  dailyUploadBytes: number;
}
