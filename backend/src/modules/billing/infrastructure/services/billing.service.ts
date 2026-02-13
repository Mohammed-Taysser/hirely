import { IBillingService } from '@/modules/billing/application/services/billing.service.interface';

export class BillingService implements IBillingService {
  async enforceDailyUploadLimit(userId: string, planId: string, size: number): Promise<void> {
    if (!userId || !planId || size <= 0) {
      return;
    }

    // Current policy: no hard cap is enforced yet.
    // This hook exists to enforce storage/upload limits when billing rules are enabled.
  }
}
