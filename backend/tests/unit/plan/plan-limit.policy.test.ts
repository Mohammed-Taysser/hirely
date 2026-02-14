import {
  classifyPlanChangeDirection,
  exceedsDailyUploadLimit,
  hasReachedDailyBulkApplyLimit,
  hasReachedDailyExportEmailLimit,
  hasReachedDailyExportLimit,
  hasReachedExportLimit,
  hasReachedResumeLimit,
  requirePlanUsageLimits,
} from '@dist/modules/plan/application/policies/plan-limit.policy';
import { ForbiddenError } from '@dist/modules/shared/application/app-error';

describe('plan-limit.policy', () => {
  it('maps plan limits to canonical usage limits', () => {
    const limits = requirePlanUsageLimits({
      id: 'limit-1',
      planId: 'plan-1',
      maxResumes: 5,
      maxExports: 10,
      dailyUploadMb: 3,
      dailyExports: 10,
      dailyExportEmails: 20,
      dailyBulkApplies: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(limits).toEqual({
      maxResumes: 5,
      maxExports: 10,
      dailyUploadMb: 3,
      dailyUploadBytes: 3 * 1024 * 1024,
      dailyExports: 10,
      dailyExportEmails: 20,
      dailyBulkApplies: 4,
    });
  });

  it('throws when limits are missing', () => {
    expect(() => requirePlanUsageLimits(null)).toThrow(ForbiddenError);
  });

  it('checks resume/export count limits', () => {
    expect(hasReachedResumeLimit(5, 5)).toBe(true);
    expect(hasReachedResumeLimit(4, 5)).toBe(false);
    expect(hasReachedExportLimit(10, 10)).toBe(true);
    expect(hasReachedExportLimit(9, 10)).toBe(false);
  });

  it('checks daily upload byte limits', () => {
    expect(exceedsDailyUploadLimit(100, 50, 149)).toBe(true);
    expect(exceedsDailyUploadLimit(100, 50, 150)).toBe(false);
  });

  it('checks daily bulk-apply limits', () => {
    expect(hasReachedDailyBulkApplyLimit(2, 2)).toBe(true);
    expect(hasReachedDailyBulkApplyLimit(1, 2)).toBe(false);
  });

  it('checks daily export count limits', () => {
    expect(hasReachedDailyExportLimit(5, 5)).toBe(true);
    expect(hasReachedDailyExportLimit(4, 5)).toBe(false);
  });

  it('checks daily export email limits', () => {
    expect(hasReachedDailyExportEmailLimit(20, 20)).toBe(true);
    expect(hasReachedDailyExportEmailLimit(19, 20)).toBe(false);
  });

  it('classifies plan change direction', () => {
    expect(
      classifyPlanChangeDirection(
        {
          maxResumes: 5,
          maxExports: 10,
          dailyUploadBytes: 3 * 1024 * 1024,
          dailyExports: 10,
          dailyExportEmails: 20,
          dailyBulkApplies: 4,
        },
        {
          maxResumes: 10,
          maxExports: 20,
          dailyUploadBytes: 6 * 1024 * 1024,
          dailyExports: 40,
          dailyExportEmails: 60,
          dailyBulkApplies: 8,
        }
      )
    ).toBe('upgrade');

    expect(
      classifyPlanChangeDirection(
        {
          maxResumes: 5,
          maxExports: 10,
          dailyUploadBytes: 3 * 1024 * 1024,
          dailyExports: 20,
          dailyExportEmails: 20,
          dailyBulkApplies: 4,
        },
        {
          maxResumes: 2,
          maxExports: 5,
          dailyUploadBytes: 1 * 1024 * 1024,
          dailyExports: 5,
          dailyExportEmails: 5,
          dailyBulkApplies: 1,
        }
      )
    ).toBe('downgrade');
  });
});
