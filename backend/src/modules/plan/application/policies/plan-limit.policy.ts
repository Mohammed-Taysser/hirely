import { PlanLimitDto, PlanUsageLimits } from '@/modules/plan/application/dto/plan-limit.dto';
import { ForbiddenError } from '@/modules/shared/application/app-error';

const MB_TO_BYTES = 1024 * 1024;

const toPlanUsageLimits = (planLimit: PlanLimitDto): PlanUsageLimits => ({
  maxResumes: planLimit.maxResumes,
  maxExports: planLimit.maxExports,
  dailyUploadMb: planLimit.dailyUploadMb,
  dailyUploadBytes: planLimit.dailyUploadMb * MB_TO_BYTES,
  dailyExports: planLimit.dailyExports,
  dailyExportEmails: planLimit.dailyExportEmails,
  dailyBulkApplies: planLimit.dailyBulkApplies,
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

export const hasReachedDailyExportLimit = (
  currentCount: number,
  dailyExportLimit: number
): boolean => currentCount >= dailyExportLimit;

export const hasReachedDailyExportEmailLimit = (
  currentCount: number,
  dailyExportEmailLimit: number
): boolean => currentCount >= dailyExportEmailLimit;

export const exceedsDailyUploadLimit = (
  usedBytes: number,
  pendingUploadBytes: number,
  dailyUploadBytes: number
): boolean => usedBytes + pendingUploadBytes > dailyUploadBytes;

export const hasReachedDailyBulkApplyLimit = (
  currentCount: number,
  dailyBulkApplyLimit: number
): boolean => currentCount >= dailyBulkApplyLimit;

type PlanLimitComparable = Pick<
  PlanUsageLimits,
  | 'maxResumes'
  | 'maxExports'
  | 'dailyUploadBytes'
  | 'dailyExports'
  | 'dailyExportEmails'
  | 'dailyBulkApplies'
>;

export const classifyPlanChangeDirection = (
  currentPlan: PlanLimitComparable,
  targetPlan: PlanLimitComparable
): 'upgrade' | 'downgrade' | 'same' | 'mixed' => {
  const comparisons = [
    targetPlan.maxResumes - currentPlan.maxResumes,
    targetPlan.maxExports - currentPlan.maxExports,
    targetPlan.dailyUploadBytes - currentPlan.dailyUploadBytes,
    targetPlan.dailyExports - currentPlan.dailyExports,
    targetPlan.dailyExportEmails - currentPlan.dailyExportEmails,
    targetPlan.dailyBulkApplies - currentPlan.dailyBulkApplies,
  ];

  const hasUpgrade = comparisons.some((value) => value > 0);
  const hasDowngrade = comparisons.some((value) => value < 0);

  if (!hasUpgrade && !hasDowngrade) {
    return 'same';
  }

  if (hasUpgrade && hasDowngrade) {
    return 'mixed';
  }

  return hasUpgrade ? 'upgrade' : 'downgrade';
};
