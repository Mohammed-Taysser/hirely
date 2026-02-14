import { PlanLimitDto, PlanUsageLimits } from '@/modules/plan/application/dto/plan-limit.dto';
import { ForbiddenError } from '@/modules/shared/application/app-error';

const MB_TO_BYTES = 1024 * 1024;

const toPlanUsageLimits = (planLimit: PlanLimitDto): PlanUsageLimits => ({
  maxResumes: planLimit.maxResumes,
  maxExports: planLimit.maxExports,
  dailyUploadMb: planLimit.dailyUploadMb,
  dailyUploadBytes: planLimit.dailyUploadMb * MB_TO_BYTES,
});

export const requirePlanUsageLimits = (planLimit: PlanLimitDto | null): PlanUsageLimits => {
  if (!planLimit) {
    throw new ForbiddenError('Plan limits are not configured');
  }

  return toPlanUsageLimits(planLimit);
};

export const hasReachedResumeLimit = (currentCount: number, maxResumes: number): boolean =>
  currentCount >= maxResumes;

export const hasReachedExportLimit = (currentCount: number, maxExports: number): boolean =>
  currentCount >= maxExports;

export const exceedsDailyUploadLimit = (
  usedBytes: number,
  pendingUploadBytes: number,
  dailyUploadBytes: number
): boolean => usedBytes + pendingUploadBytes > dailyUploadBytes;
