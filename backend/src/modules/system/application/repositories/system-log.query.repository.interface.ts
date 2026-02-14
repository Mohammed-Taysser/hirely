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
  getActionCountsByReason(
    actions: string[],
    reasons: string[],
    since?: Date
  ): Promise<Record<string, Record<string, number>>>;
  countByUserAndActionInRange(
    userId: string,
    action: string,
    start: Date,
    end: Date
  ): Promise<number>;
  hasActionSince(action: string, since: Date): Promise<boolean>;
  findFailedExportEmailJobs(
    query: FailedExportEmailJobQuery
  ): Promise<{ jobs: FailedExportEmailJobDto[]; total: number }>;
  findFailedExportEmailJobById(
    userId: string,
    logId: string
  ): Promise<FailedExportEmailJobDto | null>;
}
