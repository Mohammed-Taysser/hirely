export interface IUserPlanCommandRepository {
  changePlanNow(userId: string, planId: string): Promise<void>;
  schedulePlanChange(userId: string, planId: string, at: Date): Promise<void>;
}
