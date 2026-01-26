import type { User } from "@generated-prisma";
import resumeService from "../modules/resume/resume.service";
import { exportService } from "../modules/export/export.service";
import { canDirectDownload } from "../modules/export/export.policy";
import { pdfQueue } from "../jobs/queues/pdf.queue";
import { emailQueue } from "../jobs/queues/email.queue";
import { redis } from "../infra/redis/redis";
import errorService from "@/modules/shared/services/error.service";
 import prismaApp from "@/apps/prisma";
import { RATE_LIMIT_EXPORT } from "@/apps/constant";

const enforceRateLimit = async (key: string, max: number, windowSeconds: number) => {
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }

  if (count > max) {
    throw errorService.tooManyRequests("Export rate limit exceeded");
  }
};

export const exportResumeCommand = async (user: User, resumeId: string) => {
  await enforceRateLimit(`rate:export:${user.id}`, RATE_LIMIT_EXPORT.max, RATE_LIMIT_EXPORT.windowSeconds);

  const userPlan = await prismaApp.user.findUnique({
    where: { id: user.id },
    select: { planId: true, plan: { select: { code: true } } },
  });

  if (!userPlan?.plan) {
    throw new Error("User plan not found");
  }

  await exportService.enforceExportLimit(user.id, userPlan.planId);

  const snapshot = await resumeService.createSnapshot(user.id, resumeId);
  if (!snapshot) {
    throw new Error("Resume not found");
  }
  const exportRecord = await exportService.createExportRecord(user.id, snapshot.id);

  await pdfQueue.add("generate", {
    exportId: exportRecord.id,
    snapshotId: snapshot.id,
    userId: user.id,
  }, {
    attempts: 3,
    backoff: { type: "exponential", delay: 10000 },
  });

  if (!canDirectDownload(userPlan.plan.code)) {
    await emailQueue.add("send", {
      exportId: exportRecord.id,
      userId: user.id,
      to: user.email,
      reason: "free-tier-export",
    }, {
      attempts: 3,
      backoff: { type: "exponential", delay: 10000 },
    });
  }

  return {
    exportId: exportRecord.id,
    delivery: canDirectDownload(userPlan.plan.code) ? "download" : "email",
  };
};
