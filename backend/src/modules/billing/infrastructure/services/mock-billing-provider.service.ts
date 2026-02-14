import CONFIG from '@/apps/config';
import {
  BillingCycleInfo,
  IBillingProviderService,
} from '@/modules/billing/application/services/billing-provider.service.interface';

export class MockBillingProviderService implements IBillingProviderService {
  // The mock provider ignores user context and always returns a synthetic cycle.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getCycleInfo(_userId: string): Promise<BillingCycleInfo> {
    const currentPeriodEnd = new Date(Date.now() + CONFIG.BILLING_CYCLE_DAYS * 24 * 60 * 60 * 1000);

    return {
      currentPeriodEnd,
      provider: 'mock',
    };
  }
}
