import { BulkApplyRecipient } from '@/modules/apply/application/dto/bulk-apply.dto';

export interface BulkApplyEmailJob {
  exportId: string;
  userId: string;
  to: string;
  recipient: BulkApplyRecipient;
  reason: 'bulk-apply';
}

export interface IBulkApplyEmailQueueService {
  enqueue(job: BulkApplyEmailJob): Promise<void>;
}
