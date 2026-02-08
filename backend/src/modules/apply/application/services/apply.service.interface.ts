import { BulkApplyInput } from '@/modules/apply/application/dto/bulk-apply.dto';

export interface ApplyBatchResult {
  batchId: string;
}

export interface IApplyService {
  ensureBulkApplyAllowed(planCode: string): void;
  createBatch(userId: string, input: BulkApplyInput): Promise<ApplyBatchResult>;
}
