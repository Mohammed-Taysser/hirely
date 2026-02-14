import { Worker } from 'bullmq';

import CONFIG from '@/apps/config';
import { QUEUE_NAMES } from '@/apps/constant';
import { redisConnectionOptions } from '@/apps/redis';
import {
  cleanupExpiredExportsUseCase,
  evaluateExportFailureAlertsUseCase,
  systemLogService,
} from '@/apps/worker-containers/export-cleanup-worker.container';
import exportCleanupQueue from '@/jobs/queues/export-cleanup.queue';
import { SystemLogInput } from '@/modules/system/application/services/system-log.service.interface';
import { SystemActions } from '@/modules/system/application/system.actions';
import { logger } from '@/shared/logger';

const JOB_NAME = 'cleanup-expired-exports';
const DEFAULT_INTERVAL_MS = CONFIG.EXPORT_CLEANUP_INTERVAL_SECONDS * 1000;

const logSystem = async (input: SystemLogInput) => {
  try {
    await systemLogService.log(input);
  } catch (error) {
    logger.error('Failed to write system log', { error });
  }
};

const scheduleRepeatableJob = async () => {
  await exportCleanupQueue.add(
    JOB_NAME,
    {},
    {
      repeat: { every: DEFAULT_INTERVAL_MS },
      removeOnComplete: true,
      removeOnFail: 10,
    }
  );
};

export const startExportCleanupWorker = () => {
  scheduleRepeatableJob()
    .then(() =>
      logSystem({
        level: 'info',
        action: SystemActions.EXPORT_CLEANUP_SCHEDULED,
        metadata: {
          intervalSeconds: CONFIG.EXPORT_CLEANUP_INTERVAL_SECONDS,
          batchSize: CONFIG.EXPORT_CLEANUP_BATCH_SIZE,
          dryRun: CONFIG.EXPORT_CLEANUP_DRY_RUN,
        },
      })
    )
    .catch((error) => {
      logSystem({
        level: 'error',
        action: SystemActions.EXPORT_CLEANUP_SCHEDULE_FAILED,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    });

  return new Worker(
    QUEUE_NAMES.exportCleanup,
    async (job) => {
      const correlationId = `cleanup:${job.id}`;

      await logSystem({
        level: 'info',
        action: SystemActions.EXPORT_CLEANUP_RUN_STARTED,
        metadata: {
          jobId: job.id,
          correlationId,
          batchSize: CONFIG.EXPORT_CLEANUP_BATCH_SIZE,
          dryRun: CONFIG.EXPORT_CLEANUP_DRY_RUN,
        },
      });

      const result = await cleanupExpiredExportsUseCase.execute({
        batchSize: CONFIG.EXPORT_CLEANUP_BATCH_SIZE,
        dryRun: CONFIG.EXPORT_CLEANUP_DRY_RUN,
      });

      if (result.isFailure) {
        const error = result.error ?? new Error('Export cleanup failed');
        await logSystem({
          level: 'error',
          action: SystemActions.EXPORT_CLEANUP_RUN_FAILED,
          metadata: {
            jobId: job.id,
            correlationId,
          },
          message: error.message,
        });

        throw new Error(error.message);
      }

      const summary = result.getValue();
      let alertSummary: unknown = null;
      const alertResult = await evaluateExportFailureAlertsUseCase.execute({});
      if (alertResult.isFailure) {
        const error = alertResult.error ?? new Error('Export alert evaluation failed');
        await logSystem({
          level: 'error',
          action: SystemActions.EXPORT_ALERT_EVALUATION_FAILED,
          metadata: {
            jobId: job.id,
            correlationId,
          },
          message: error.message,
        });
      } else {
        alertSummary = alertResult.getValue();
      }

      await logSystem({
        level: summary.failed > 0 ? 'warn' : 'info',
        action: SystemActions.EXPORT_CLEANUP_RUN_COMPLETED,
        metadata: {
          jobId: job.id,
          correlationId,
          scanned: summary.scanned,
          deletedRecords: summary.deletedRecords,
          deletedFiles: summary.deletedFiles,
          wouldDeleteRecords: summary.wouldDeleteRecords,
          wouldDeleteFiles: summary.wouldDeleteFiles,
          dryRun: summary.dryRun,
          failed: summary.failed,
          failures: summary.failures,
          alerts: alertSummary,
        },
      });
    },
    {
      connection: redisConnectionOptions,
    }
  )
    .on('ready', () => {
      logSystem({ level: 'info', action: SystemActions.WORKER_EXPORT_CLEANUP_READY });
    })
    .on('failed', (job, err) => {
      logSystem({
        level: 'error',
        action: SystemActions.WORKER_EXPORT_CLEANUP_FAILED,
        metadata: { jobId: job?.id },
        message: err.message,
      });
    });
};
