import { Worker } from 'bullmq';

import { QUEUE_NAMES } from '@/apps/constant';
import { redisConnectionOptions } from '@/apps/redis';
import { ProcessExportPdfUseCase } from '@/modules/export/application/use-cases/process-export-pdf/process-export-pdf.use-case';
import { ExportService } from '@/modules/export/infrastructure/services/export.service';
import { logger } from '@/shared/logger';

const exportService = new ExportService();
const processExportPdfUseCase = new ProcessExportPdfUseCase(exportService);

export const startPdfWorker = () => {
  return new Worker(
    QUEUE_NAMES.pdf,
    async (job) => {
      logger.info('Processing PDF job', { jobId: job.id, exportId: job.data.exportId });
      const { exportId, snapshotId, userId } = job.data as {
        exportId: string;
        snapshotId: string;
        userId: string;
      };

      const result = await processExportPdfUseCase.execute({ exportId, snapshotId, userId });
      if (result.isFailure) {
        const error = result.error ?? new Error('PDF generation failed');
        logger.error('PDF generation failed', { exportId, error });
        throw new Error(error.message);
      }
    },
    {
      connection: redisConnectionOptions,
    }
  )
    .on('ready', () => {
      logger.info('PDF worker is ready and listening');
    })
    .on('completed', (job) => {
      logger.info('PDF job completed successfully', { jobId: job.id, exportId: job.data.exportId });
    })
    .on('failed', (job, err) => {
      console.log(err);

      logger.error('PDF job failed', { jobId: job?.id, error: err.message });
    });
};
