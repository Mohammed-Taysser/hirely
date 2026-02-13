import pdfQueue from '@/jobs/queues/pdf.queue';
import {
  ExportQueueJob,
  IExportQueueService,
} from '@/modules/resume/application/services/export-queue.service.interface';

export class BullmqExportQueueService implements IExportQueueService {
  async enqueuePdf(job: ExportQueueJob): Promise<void> {
    await pdfQueue.add('generate', job, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 10000 },
    });
  }
}
