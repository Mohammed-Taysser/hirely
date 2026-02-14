export interface BillingCycleInfo {
  currentPeriodEnd: Date;
  provider: string;
}

export interface IBillingProviderService {
  getCycleInfo(userId: string): Promise<BillingCycleInfo>;
}
