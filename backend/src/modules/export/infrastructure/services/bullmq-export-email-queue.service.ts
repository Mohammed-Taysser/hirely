import emailQueue from '@/jobs/queues/email.queue';
import {
  ExportEmailJob,
  IExportEmailQueueService,
} from '@/modules/export/application/services/export-email-queue.service.interface';

export class BullmqExportEmailQueueService implements IExportEmailQueueService {
  async enqueue(job: ExportEmailJob): Promise<void> {
    await emailQueue.add('send', job, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 10000 },
    });
  }
}
