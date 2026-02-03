import type { User } from '@generated-prisma';

import pdfQueue from '../jobs/queues/pdf.queue';
import { canDirectDownload } from '../modules/export/export.policy';
import { exportService } from '../modules/export/export.service';
import resumeService from '../modules/resume/resume.service';

import prismaApp from '@/apps/prisma';
import cacheService from '@/modules/shared/services/cache.service';
import errorService from '@/modules/shared/services/error.service';

const enforceRateLimit = async (key: string, max: number, windowSeconds: number) => {
  const count = await cacheService.increment(key);
  if (count === 1) {
    await cacheService.expire(key, windowSeconds);
  }

  if (count > max) {
    throw errorService.tooManyRequests('Export rate limit exceeded');
  }
};

export const exportResumeCommand = async (user: User, resumeId: string) => {
  await enforceRateLimit(`rate:export:${user.id}`, 50, 120);

  const userPlan = await prismaApp.user.findUnique({
    where: { id: user.id },
    select: { planId: true, plan: { select: { code: true } } },
  });

  if (!userPlan?.plan) {
    throw errorService.notFound('User plan not found');
  }

  await exportService.enforceExportLimit(user.id, userPlan.planId);

  const snapshot = await resumeService.createSnapshot(user.id, resumeId);
  if (!snapshot) {
    throw new Error('Resume not found');
  }
  const exportRecord = await exportService.createExportRecord(user.id, snapshot.id);

  await pdfQueue.add(
    'generate',
    {
      exportId: exportRecord.id,
      snapshotId: snapshot.id,
      userId: user.id,
    },
    {
      attempts: 3,
      backoff: { type: 'exponential', delay: 10000 },
    }
  );

  // We no longer queue the email here because it will be queued by the pdf.worker
  // only after the PDF is marked as READY to avoid "Export not ready" errors.

  return {
    exportId: exportRecord.id,
    delivery: canDirectDownload(userPlan.plan.code) ? 'download' : 'email',
  };
};
