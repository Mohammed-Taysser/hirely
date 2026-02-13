import emailQueue from '@/jobs/queues/email.queue';
import {
  BulkApplyEmailJob,
  IBulkApplyEmailQueueService,
} from '@/modules/resume/application/services/bulk-apply-email-queue.service.interface';

export class BullmqBulkApplyEmailQueueService implements IBulkApplyEmailQueueService {
  async enqueue(job: BulkApplyEmailJob): Promise<void> {
    await emailQueue.add('send', job, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 10000 },
    });
  }
}
