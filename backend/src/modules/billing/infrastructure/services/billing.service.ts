import CONFIG from '@/apps/config';
import { IBillingProviderService } from '@/modules/billing/application/services/billing-provider.service.interface';
import { IBillingService } from '@/modules/billing/application/services/billing.service.interface';
import {
  classifyPlanChangeDirection,
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
    private readonly resumeExportRepository: IResumeExportRepository,
    private readonly billingProviderService: IBillingProviderService
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

  async resolvePlanChangeSchedule(request: {
    userId: string;
    currentPlanId: string;
    targetPlanId: string;
    requestedScheduleAt?: Date | null;
  }): Promise<{
    effectiveAt: Date | null;
    reason: 'immediate' | 'user-scheduled' | 'billing-cycle';
  }> {
    if (request.requestedScheduleAt) {
      return {
        effectiveAt: request.requestedScheduleAt,
        reason: 'user-scheduled',
      };
    }

    if (request.currentPlanId === request.targetPlanId) {
      return { effectiveAt: null, reason: 'immediate' };
    }

    if (CONFIG.BILLING_DOWNGRADE_BEHAVIOR !== 'cycle_end') {
      return { effectiveAt: null, reason: 'immediate' };
    }

    const [currentPlanLimit, targetPlanLimit] = await Promise.all([
      this.planLimitQueryRepository.findByPlanId(request.currentPlanId),
      this.planLimitQueryRepository.findByPlanId(request.targetPlanId),
    ]);

    const currentUsageLimits = requirePlanUsageLimits(currentPlanLimit);
    const targetUsageLimits = requirePlanUsageLimits(targetPlanLimit);
    const direction = classifyPlanChangeDirection(currentUsageLimits, targetUsageLimits);

    if (direction !== 'downgrade') {
      return { effectiveAt: null, reason: 'immediate' };
    }

    const cycle = await this.billingProviderService.getCycleInfo(request.userId);
    const effectiveAt = cycle.currentPeriodEnd;
    if (effectiveAt.getTime() <= Date.now()) {
      return { effectiveAt: null, reason: 'immediate' };
    }

    return {
      effectiveAt,
      reason: 'billing-cycle',
    };
  }
}
