import { BulkApplyRecipient } from '@/modules/resume/application/bulk-apply.types';

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
