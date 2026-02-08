import { randomUUID } from 'crypto';

import { ValidationError } from '@/modules/shared/application/app-error';
import { BulkApplyInput } from '@/modules/apply/application/dto/bulk-apply.dto';
import { IApplyService } from '@/modules/apply/application/services/apply.service.interface';

class ApplyService implements IApplyService {
  ensureBulkApplyAllowed(planCode: string) {
    if (!planCode) {
      throw new ValidationError('Invalid plan');
    }
  }

  async createBatch(_userId: string, _input: BulkApplyInput) {
    return { batchId: randomUUID() };
  }
}

export { ApplyService };
