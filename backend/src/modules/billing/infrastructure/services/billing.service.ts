import prisma from '@/apps/prisma';
import { IBillingService } from '@/modules/billing/application/services/billing.service.interface';
import { ForbiddenError } from '@/modules/shared/application/app-error';

const MB_TO_BYTES = 1024 * 1024;

const getUtcDayRange = (now = new Date()) => {
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setUTCHours(23, 59, 59, 999);

  return { start, end };
};

export class BillingService implements IBillingService {
  async enforceDailyUploadLimit(userId: string, planId: string, size: number): Promise<void> {
    if (!userId || !planId || size <= 0) {
      return;
    }

    const planLimit = await prisma.planLimit.findUnique({ where: { planId } });
    if (!planLimit) {
      throw new ForbiddenError('Plan limits are not configured');
    }

    const dailyLimitBytes = planLimit.dailyUploadMb * MB_TO_BYTES;
    const { start, end } = getUtcDayRange();
    const uploadedBytes = await prisma.resumeExport.aggregate({
      where: {
        userId,
        status: 'READY',
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      _sum: {
        sizeBytes: true,
      },
    });

    const usedBytes = uploadedBytes._sum.sizeBytes ?? 0;

    if (usedBytes + size > dailyLimitBytes) {
      throw new ForbiddenError('Daily upload limit reached for your plan');
    }
  }
}
