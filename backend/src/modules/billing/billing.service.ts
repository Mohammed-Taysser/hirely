class BillingService {
  async enforceDailyUploadLimit(userId: string, planId: string, size: number) {
    // Placeholder: allow all for now
    return true;
  }
}

export const billingService = new BillingService();
