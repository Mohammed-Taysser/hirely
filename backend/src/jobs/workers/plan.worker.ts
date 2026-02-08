import { Worker } from 'bullmq';

import CONFIG from '@/apps/config';
import { QUEUE_NAMES } from '@/apps/constant';
import prisma from '@/apps/prisma';
import { redisConnectionOptions } from '@/apps/redis';
import planQueue from '@/jobs/queues/plan.queue';
import { logger } from '@/shared/logger';

const JOB_NAME = 'apply-scheduled-plan-changes';
const DEFAULT_INTERVAL_MS = CONFIG.PLAN_CHANGE_INTERVAL_SECONDS * 1000;

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
  const now = new Date();
  const users = await prisma.user.findMany({
    where: {
      pendingPlanId: { not: null },
      pendingPlanAt: { lte: now },
    },
    select: { id: true, pendingPlanId: true },
  });

  for (const user of users) {
    if (!user.pendingPlanId) continue;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        planId: user.pendingPlanId,
        pendingPlanId: null,
        pendingPlanAt: null,
      },
    });
  }

  return users.length;
};

export const startPlanWorker = () => {
  scheduleRepeatableJob().catch((error) => {
    logger.error('Failed to schedule plan change job', { error });
  });

  return new Worker(
    QUEUE_NAMES.planChanges,
    async () => {
      logger.info('Applying scheduled plan changes');
      const updated = await applyScheduledPlanChanges();
      logger.info('Scheduled plan changes applied', { updated });
    },
    {
      connection: redisConnectionOptions,
    }
  )
    .on('ready', () => {
      logger.info('Plan change worker is ready and listening');
    })
    .on('failed', (job, err) => {
      logger.error('Plan change job failed', { jobId: job?.id, error: err.message });
    });
};
