import { Worker } from 'bullmq';

import { redisConnectionOptions } from '@/apps/redis';
import {
  sendExportEmailUseCase,
  systemLogService,
} from '@/apps/worker-containers/email-worker.container';
import { SystemLogInput } from '@/modules/system/application/services/system-log.service.interface';
import { SystemActions } from '@/modules/system/application/system.actions';
import { QUEUE_NAMES } from '@/shared/constants';
import { logger } from '@/shared/logger';

const logSystem = async (input: SystemLogInput) => {
  try {
    await systemLogService.log(input);
  } catch (error) {
    logger.error('Failed to write system log', { error });
  }
};

export const startEmailWorker = () => {
  return new Worker(
    QUEUE_NAMES.email,
    async (job) => {
      const { exportId, userId, to, recipient, reason } = job.data as {
        exportId: string;
        userId: string;
        to: string;
        recipient?: { name?: string; company?: string; message?: string };
        reason: 'free-tier-export' | 'bulk-apply';
      };
      const correlationId = `email:${job.id}`;

      await logSystem({
        level: 'info',
        action: SystemActions.EXPORT_EMAIL_PROCESSING,
        userId,
        metadata: {
          jobId: job.id,
          exportId,
          to,
          reason,
          correlationId,
          attemptsMade: job.attemptsMade,
          attemptsStarted: job.attemptsStarted,
        },
      });

      const result = await sendExportEmailUseCase.execute({
        exportId,
        userId,
        to,
        recipient,
        reason,
      });

      if (result.isFailure) {
        const error = result.error ?? new Error('Email job failed');
        await logSystem({
          level: 'error',
          action: SystemActions.EXPORT_EMAIL_FAILED,
          userId,
          metadata: {
            jobId: job.id,
            exportId,
            to,
            reason,
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
        action: SystemActions.EXPORT_EMAIL_SENT,
        userId,
        metadata: {
          jobId: job.id,
          exportId,
          to,
          reason,
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
      logSystem({ level: 'info', action: SystemActions.WORKER_EMAIL_READY });
    })
    .on('completed', (job) => {
      logSystem({
        level: 'info',
        action: SystemActions.WORKER_EMAIL_COMPLETED,
        metadata: { jobId: job.id, exportId: job.data.exportId },
      });
    })
    .on('failed', (job, err) => {
      const jobData = (job?.data ?? {}) as Record<string, unknown>;
      const userId = typeof jobData.userId === 'string' ? jobData.userId : undefined;
      logSystem({
        level: 'error',
        action: SystemActions.WORKER_EMAIL_FAILED,
        userId,
        metadata: {
          jobId: job?.id,
          correlationId: job?.id ? `email:${job.id}` : undefined,
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
