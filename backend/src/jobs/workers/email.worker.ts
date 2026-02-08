import { Worker } from 'bullmq';

import { redisConnectionOptions } from '@/apps/redis';
import { SendExportEmailUseCase } from '@/modules/export/application/use-cases/send-export-email/send-export-email.use-case';
import { ExportEmailService } from '@/modules/export/infrastructure/services/export-email.service';
import { QUEUE_NAMES } from '@/shared/constants';
import { logger } from '@/shared/logger';

const exportEmailService = new ExportEmailService();
const sendExportEmailUseCase = new SendExportEmailUseCase(exportEmailService);

export const startEmailWorker = () => {
  return new Worker(
    QUEUE_NAMES.email,
    async (job) => {
      logger.info('Processing Email job', { jobId: job.id, exportId: job.data.exportId });
      const { exportId, userId, to, recipient, reason } = job.data as {
        exportId: string;
        userId: string;
        to: string;
        recipient?: { name?: string; company?: string; message?: string };
        reason: 'free-tier-export' | 'bulk-apply';
      };
      const result = await sendExportEmailUseCase.execute({
        exportId,
        userId,
        to,
        recipient,
        reason,
      });

      if (result.isFailure) {
        const error = result.error ?? new Error('Email job failed');
        logger.error('Email job failed', { exportId, error });
        throw new Error(error.message);
      }
    },
    {
      connection: redisConnectionOptions,
    }
  )
    .on('ready', () => {
      logger.info('Email worker is ready and listening');
    })
    .on('completed', (job) => {
      logger.info('Email job completed successfully', {
        jobId: job.id,
        exportId: job.data.exportId,
      });
    })
    .on('failed', (job, err) => {
      logger.error('Email job failed', { jobId: job?.id, error: err.message });
    });
};
