import { randomUUID } from 'crypto';
import { z } from 'zod';

import errorService from '@/modules/shared/services/error.service';

const recipientSchema = z.object({
  email: z.string().email(),
  name: z.string().trim().min(1).optional(),
});

const bulkApplySchema = z.object({
  resumeId: z.string().uuid(),
  recipients: z.array(recipientSchema).min(1),
});

type BulkApplyInput = z.infer<typeof bulkApplySchema>;
type BulkApplyRecipient = z.infer<typeof recipientSchema>;

class ApplyService {
  ensureBulkApplyAllowed(planCode: string) {
    if (!planCode) {
      throw errorService.badRequest('Invalid plan');
    }
  }

  async createBatch(_userId: string, _input: BulkApplyInput) {
    return { batchId: randomUUID() };
  }
}

const applyService = new ApplyService();

export { applyService, bulkApplySchema };
export type { BulkApplyInput, BulkApplyRecipient };
