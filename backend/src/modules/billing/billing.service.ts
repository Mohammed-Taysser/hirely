 import { redis } from "../../infra/redis/redis";
import errorService from "@/modules/shared/services/error.service";
import { withinDailyUploadLimit } from "./billing.policy";
import prisma from "@/apps/prisma";

const bytesFromMb = (mb: number) => mb * 1024 * 1024;

const getDayKey = () => {
  const now = new Date();
  return now.toISOString().slice(0, 10);
};

const secondsUntilTomorrowUtc = () => {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return Math.max(60, Math.floor((tomorrow.getTime() - now.getTime()) / 1000));
};

export const billingService = {
  async getPlanLimit(planId: string) {
    return prisma.planLimit.findUnique({
      where: { planId },
    });
  },

  async enforceDailyUploadLimit(userId: string, planId: string, bytesToAdd: number) {
    const planLimit = await this.getPlanLimit(planId);
    if (!planLimit) {
      throw errorService.forbidden("Plan limits are not configured");
    }
    const limitBytes = bytesFromMb(planLimit.dailyUploadMb);
    const dayKey = getDayKey();
    const usageKey = `usage:upload:${userId}:${dayKey}`;

    const [newTotal] = await redis
      .multi()
      .incrby(usageKey, bytesToAdd)
      .expire(usageKey, secondsUntilTomorrowUtc())
      .exec();

    const currentBytes = Number(newTotal?.[1] ?? 0);
    if (!withinDailyUploadLimit(limitBytes, currentBytes - bytesToAdd, bytesToAdd)) {
      await redis.decrby(usageKey, bytesToAdd);
      throw errorService.tooManyRequests("Daily upload limit exceeded");
    }

    return { currentBytes, limitBytes };
  },
};
