import type { User } from '@generated-prisma';

import { applyService, bulkApplySchema, type BulkApplyRecipient } from '../modules/apply/apply.service';
import resumeService from '../modules/resume/resume.service';
import { exportService } from '../modules/export/export.service';
import pdfQueue from '../jobs/queues/pdf.queue';
import emailQueue from '../jobs/queues/email.queue';
import { redis } from '../infra/redis/redis';

import errorService from '@/modules/shared/services/error.service';
import { RATE_LIMITS } from '@/apps/constant';
import prismaApp from '@/apps/prisma';

const enforceRateLimit = async (key: string, max: number, windowSeconds: number) => {
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }

  if (count > max) {
    throw errorService.tooManyRequests("Bulk apply rate limit exceeded");
  }
};

export const bulkApplyCommand = async (user: User, payload: unknown) => {
  const limit = RATE_LIMITS.BULK_APPLY;
  await enforceRateLimit(`rate:bulk-apply:${user.id}`, limit.max, limit.windowSeconds);

  const input = bulkApplySchema.parse(payload);
  const userPlan = await prismaApp.user.findUnique({
    where: { id: user.id },
    select: { planId: true, plan: { select: { code: true } } },
  });

  if (!userPlan?.plan) {
    throw new Error("User plan not found");
  }

  applyService.ensureBulkApplyAllowed(userPlan.plan.code);

  await exportService.enforceExportLimit(user.id, userPlan.planId);

  const batch = await applyService.createBatch(user.id, input);
  const snapshot = await resumeService.createSnapshot(user.id, input.resumeId);
  if (!snapshot) {
    throw new Error("Resume not found");
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

  await Promise.all(
    input.recipients.map((recipient: BulkApplyRecipient) =>
      emailQueue.add(
        'send',
        {
          exportId: exportRecord.id,
          userId: user.id,
          to: recipient.email,
          recipient,
          reason: 'bulk-apply',
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 10000 },
        }
      )
    )
  );

  return {
    batchId: batch.batchId,
    exportId: exportRecord.id,
    recipientCount: input.recipients.length,
  };
};
