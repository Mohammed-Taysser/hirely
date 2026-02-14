import CONFIG from '@/apps/config';
import pdfQueue from '@/jobs/queues/pdf.queue';
import { parsePdfExportQueuePayload } from '@/modules/resume/application/contracts/export-queue.contract';
import {
  ExportQueueJob,
  IExportQueueService,
} from '@/modules/resume/application/services/export-queue.service.interface';

export class BullmqExportQueueService implements IExportQueueService {
  async enqueuePdf(job: ExportQueueJob): Promise<void> {
    const payload = parsePdfExportQueuePayload(job);

    await pdfQueue.add('generate', payload, {
      attempts: CONFIG.EXPORT_JOB_ATTEMPTS,
      backoff: { type: 'exponential', delay: CONFIG.EXPORT_JOB_BACKOFF_MS },
      removeOnComplete: CONFIG.EXPORT_JOB_KEEP_COMPLETED,
      removeOnFail: CONFIG.EXPORT_JOB_KEEP_FAILED,
    });
  }
}
