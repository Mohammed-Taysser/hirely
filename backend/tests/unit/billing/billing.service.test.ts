import { BillingService } from '@dist/modules/billing/infrastructure/services/billing.service';

describe('BillingService', () => {
  it('resolves for valid input', async () => {
    const service = new BillingService();

    await expect(service.enforceDailyUploadLimit('user-1', 'plan-1', 1024)).resolves.toBeUndefined();
  });

  it('resolves for empty input without throwing', async () => {
    const service = new BillingService();

    await expect(service.enforceDailyUploadLimit('', '', 0)).resolves.toBeUndefined();
  });
});
