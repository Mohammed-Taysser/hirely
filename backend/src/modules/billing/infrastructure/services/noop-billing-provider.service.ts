import {
  BillingCycleInfo,
  IBillingProviderService,
} from '@/modules/billing/application/services/billing-provider.service.interface';

export class NoopBillingProviderService implements IBillingProviderService {
  // The noop provider has no external billing state to inspect.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getCycleInfo(_userId: string): Promise<BillingCycleInfo> {
    return {
      currentPeriodEnd: new Date(),
      provider: 'none',
    };
  }
}
