export interface IBillingService {
  enforceDailyUploadLimit(userId: string, planId: string, size: number): Promise<void>;
}
