import CONFIG from '@/apps/config';
import emailQueue from '@/jobs/queues/email.queue';
import { parseFreeTierExportEmailQueuePayload } from '@/modules/resume/application/contracts/export-queue.contract';
import {
  ExportEmailJob,
  IExportEmailQueueService,
} from '@/modules/resume/application/services/export-email-queue.service.interface';

export class BullmqExportEmailQueueService implements IExportEmailQueueService {
  async enqueue(job: ExportEmailJob): Promise<void> {
    const payload = parseFreeTierExportEmailQueuePayload(job);

    await emailQueue.add('send', payload, {
      attempts: CONFIG.EXPORT_JOB_ATTEMPTS,
      backoff: { type: 'exponential', delay: CONFIG.EXPORT_JOB_BACKOFF_MS },
      removeOnComplete: CONFIG.EXPORT_JOB_KEEP_COMPLETED,
      removeOnFail: CONFIG.EXPORT_JOB_KEEP_FAILED,
    });
  }
}
