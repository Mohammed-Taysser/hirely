export interface AppliedUserPlanChange {
  userId: string;
  planId: string;
}

export interface IUserPlanChangeRepository {
  applyScheduledPlanChanges(now: Date): Promise<AppliedUserPlanChange[]>;
}
