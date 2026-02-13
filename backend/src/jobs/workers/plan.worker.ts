import { Worker } from 'bullmq';

import CONFIG from '@/apps/config';
import { QUEUE_NAMES } from '@/apps/constant';
import { redisConnectionOptions } from '@/apps/redis';
import {
  applyScheduledPlanChangesUseCase,
  auditLogService,
  systemLogService,
} from '@/apps/worker-containers/plan-worker.container';
import planQueue from '@/jobs/queues/plan.queue';
import { AuditActions } from '@/modules/audit/application/audit.actions';
import { buildAuditEntity } from '@/modules/audit/application/audit.entity';
import { SystemLogInput } from '@/modules/system/application/services/system-log.service.interface';
import { SystemActions } from '@/modules/system/application/system.actions';
import { logger } from '@/shared/logger';

const JOB_NAME = 'apply-scheduled-plan-changes';
const DEFAULT_INTERVAL_MS = CONFIG.PLAN_CHANGE_INTERVAL_SECONDS * 1000;

const logSystem = async (input: SystemLogInput) => {
  try {
    await systemLogService.log(input);
  } catch (error) {
    logger.error('Failed to write system log', { error });
  }
};

const logAudit = async (
  input: { action: string; actorUserId?: string; metadata?: Record<string, unknown> } & ReturnType<
    typeof buildAuditEntity
  >
) => {
  try {
    await auditLogService.log(input);
  } catch (error) {
    logger.error('Failed to write audit log', { error });
  }
};

const scheduleRepeatableJob = async () => {
  await planQueue.add(
    JOB_NAME,
    {},
    {
      repeat: { every: DEFAULT_INTERVAL_MS },
      removeOnComplete: true,
      removeOnFail: 10,
    }
  );
};

const applyScheduledPlanChanges = async () => {
  const result = await applyScheduledPlanChangesUseCase.execute({ now: new Date() });
  if (result.isFailure) {
    throw result.error;
  }

  const appliedChanges = result.getValue();
  for (const change of appliedChanges) {
    await logSystem({
      level: 'info',
      action: SystemActions.USER_PLAN_APPLIED,
      userId: change.userId,
      metadata: {
        planId: change.planId,
        scheduled: true,
      },
    });

    await logAudit({
      action: AuditActions.USER_PLAN_APPLIED,
      actorUserId: change.userId,
      ...buildAuditEntity('user', change.userId),
      metadata: {
        planId: change.planId,
        scheduled: true,
      },
    });
  }

  return appliedChanges.length;
};

export const startPlanWorker = () => {
  scheduleRepeatableJob()
    .then(() =>
      logSystem({
        level: 'info',
        action: SystemActions.PLAN_WORKER_SCHEDULED,
        metadata: { intervalSeconds: CONFIG.PLAN_CHANGE_INTERVAL_SECONDS },
      })
    )
    .catch((error) => {
      logSystem({
        level: 'error',
        action: SystemActions.PLAN_WORKER_SCHEDULE_FAILED,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    });

  return new Worker(
    QUEUE_NAMES.planChanges,
    async () => {
      await logSystem({ level: 'info', action: SystemActions.PLAN_WORKER_RUN_STARTED });
      const updated = await applyScheduledPlanChanges();
      await logSystem({
        level: 'info',
        action: SystemActions.PLAN_WORKER_RUN_COMPLETED,
        metadata: { updated },
      });
    },
    {
      connection: redisConnectionOptions,
    }
  )
    .on('ready', () => {
      logSystem({ level: 'info', action: SystemActions.PLAN_WORKER_READY });
    })
    .on('failed', (job, err) => {
      logSystem({
        level: 'error',
        action: SystemActions.PLAN_WORKER_RUN_FAILED,
        metadata: { jobId: job?.id },
        message: err.message,
      });
    });
};
