import { IBillingService } from '@/modules/billing/application/services/billing.service.interface';
import {
  exceedsDailyUploadLimit,
  requirePlanUsageLimits,
} from '@/modules/plan/application/policies/plan-limit.policy';
import { IPlanLimitQueryRepository } from '@/modules/plan/application/repositories/plan-limit.query.repository.interface';
import { IResumeExportRepository } from '@/modules/resume/application/repositories/resume-export.repository.interface';
import { ForbiddenError } from '@/modules/shared/application/app-error';

const getUtcDayRange = (now = new Date()) => {
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setUTCHours(23, 59, 59, 999);

  return { start, end };
};

export class BillingService implements IBillingService {
  constructor(
    private readonly planLimitQueryRepository: IPlanLimitQueryRepository,
    private readonly resumeExportRepository: IResumeExportRepository
  ) {}

  async enforceDailyUploadLimit(userId: string, planId: string, size: number): Promise<void> {
    if (!userId || !planId || size <= 0) {
      return;
    }

    const planLimit = await this.planLimitQueryRepository.findByPlanId(planId);
    const planUsageLimits = requirePlanUsageLimits(planLimit);

    const { start, end } = getUtcDayRange();
    const usedBytes = await this.resumeExportRepository.getUploadedBytesByUserInRange(
      userId,
      start,
      end
    );

    if (exceedsDailyUploadLimit(usedBytes, size, planUsageLimits.dailyUploadBytes)) {
      throw new ForbiddenError('Daily upload limit reached for your plan');
    }
  }
}
