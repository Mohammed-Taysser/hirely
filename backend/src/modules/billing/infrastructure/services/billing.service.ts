import { IBillingService } from '@/modules/billing/application/services/billing.service.interface';

export class BillingService implements IBillingService {
  async enforceDailyUploadLimit(_userId: string, _planId: string, _size: number): Promise<void> {
    // Placeholder: allow all for now
  }
}
