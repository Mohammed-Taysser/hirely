import CONFIG from '@/apps/config';
import emailQueue from '@/jobs/queues/email.queue';
import { parseBulkApplyEmailQueuePayload } from '@/modules/resume/application/contracts/export-queue.contract';
import {
  BulkApplyEmailJob,
  IBulkApplyEmailQueueService,
} from '@/modules/resume/application/services/bulk-apply-email-queue.service.interface';

export class BullmqBulkApplyEmailQueueService implements IBulkApplyEmailQueueService {
  async enqueue(job: BulkApplyEmailJob): Promise<void> {
    const payload = parseBulkApplyEmailQueuePayload(job);

    await emailQueue.add('send', payload, {
      attempts: CONFIG.EXPORT_JOB_ATTEMPTS,
      backoff: { type: 'exponential', delay: CONFIG.EXPORT_JOB_BACKOFF_MS },
      removeOnComplete: CONFIG.EXPORT_JOB_KEEP_COMPLETED,
      removeOnFail: CONFIG.EXPORT_JOB_KEEP_FAILED,
    });
  }
}
