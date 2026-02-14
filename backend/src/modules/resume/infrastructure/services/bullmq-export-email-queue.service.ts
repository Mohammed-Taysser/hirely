import CONFIG from '@/apps/config';
import emailQueue from '@/jobs/queues/email.queue';
import {
  ExportEmailJob,
  IExportEmailQueueService,
} from '@/modules/resume/application/services/export-email-queue.service.interface';

export class BullmqExportEmailQueueService implements IExportEmailQueueService {
  async enqueue(job: ExportEmailJob): Promise<void> {
    await emailQueue.add('send', job, {
      attempts: CONFIG.EXPORT_JOB_ATTEMPTS,
      backoff: { type: 'exponential', delay: CONFIG.EXPORT_JOB_BACKOFF_MS },
      removeOnComplete: CONFIG.EXPORT_JOB_KEEP_COMPLETED,
      removeOnFail: CONFIG.EXPORT_JOB_KEEP_FAILED,
    });
  }
}
