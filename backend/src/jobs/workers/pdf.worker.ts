import { Worker } from 'bullmq';

import { QUEUE_NAMES } from '@/apps/constant';
import { redisConnectionOptions } from '@/apps/redis';
import {
  processExportPdfUseCase,
  systemLogService,
} from '@/apps/worker-containers/pdf-worker.container';
import { parsePdfExportQueuePayload } from '@/modules/resume/application/contracts/export-queue.contract';
import { SystemLogInput } from '@/modules/system/application/services/system-log.service.interface';
import { SystemActions } from '@/modules/system/application/system.actions';
import { logger } from '@/shared/logger';

const logSystem = async (input: SystemLogInput) => {
  try {
    await systemLogService.log(input);
  } catch (error) {
    logger.error('Failed to write system log', { error });
  }
};

export const startPdfWorker = () => {
  return new Worker(
    QUEUE_NAMES.pdf,
    async (job) => {
      const { exportId, snapshotId, userId } = parsePdfExportQueuePayload(job.data);
      const correlationId = `pdf:${job.id}`;

      await logSystem({
        level: 'info',
        action: SystemActions.EXPORT_PDF_PROCESSING,
        userId,
        metadata: {
          jobId: job.id,
          exportId,
          snapshotId,
          correlationId,
          attemptsMade: job.attemptsMade,
          attemptsStarted: job.attemptsStarted,
        },
      });

      const result = await processExportPdfUseCase.execute({ exportId, snapshotId, userId });
      if (result.isFailure) {
        const error = result.error ?? new Error('PDF generation failed');
        await logSystem({
          level: 'error',
          action: SystemActions.EXPORT_PDF_FAILED,
          userId,
          metadata: {
            jobId: job.id,
            exportId,
            snapshotId,
            correlationId,
            attemptsMade: job.attemptsMade,
            attemptsStarted: job.attemptsStarted,
          },
          message: error.message,
        });
        throw new Error(error.message);
      }

      await logSystem({
        level: 'info',
        action: SystemActions.EXPORT_PDF_PROCESSED,
        userId,
        metadata: {
          jobId: job.id,
          exportId,
          snapshotId,
          correlationId,
          attemptsMade: job.attemptsMade,
          attemptsStarted: job.attemptsStarted,
        },
      });
    },
    {
      connection: redisConnectionOptions,
    }
  )
    .on('ready', () => {
      logSystem({ level: 'info', action: SystemActions.WORKER_PDF_READY });
    })
    .on('completed', (job) => {
      logSystem({
        level: 'info',
        action: SystemActions.WORKER_PDF_COMPLETED,
        metadata: { jobId: job.id, exportId: job.data.exportId },
      });
    })
    .on('failed', (job, err) => {
      logger.error('PDF worker failed', { error: err });
      const jobData = (job?.data ?? {}) as Record<string, unknown>;
      const userId = typeof jobData.userId === 'string' ? jobData.userId : undefined;
      logSystem({
        level: 'error',
        action: SystemActions.WORKER_PDF_FAILED,
        userId,
        metadata: {
          jobId: job?.id,
          correlationId: job?.id ? `pdf:${job.id}` : undefined,
          exportId: jobData.exportId,
          userId: jobData.userId,
          attemptsMade: job?.attemptsMade,
          attemptsStarted: job?.attemptsStarted,
          failedReason: err.message,
          stacktrace: err.stack ?? null,
        },
        message: err.message,
      });
    });
};
