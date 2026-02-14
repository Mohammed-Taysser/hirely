export interface FailedExportEmailJobDto {
  id: string;
  action: string;
  message: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export interface FailedExportEmailJobQuery {
  userId: string;
  page: number;
  limit: number;
}

export interface ISystemLogQueryRepository {
  getActionCounts(actions: string[], since?: Date): Promise<Record<string, number>>;
  findFailedExportEmailJobs(
    query: FailedExportEmailJobQuery
  ): Promise<{ jobs: FailedExportEmailJobDto[]; total: number }>;
}
