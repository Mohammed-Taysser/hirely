import { BillingService } from '@dist/modules/billing/infrastructure/services/billing.service';
import { ForbiddenError } from '@dist/modules/shared/application/app-error';

describe('BillingService', () => {
  const buildDependencies = () => {
    const planLimitQueryRepository = {
      findByPlanId: jest.fn().mockResolvedValue({
        id: 'limit-1',
        planId: 'plan-1',
        maxResumes: 10,
        maxExports: 10,
        dailyUploadMb: 1,
        dailyExports: 10,
        dailyExportEmails: 20,
        dailyBulkApplies: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    };

    const resumeExportRepository = {
      getUploadedBytesByUserInRange: jest.fn().mockResolvedValue(0),
      create: jest.fn(),
      markReady: jest.fn(),
      markFailed: jest.fn(),
      countByUser: jest.fn(),
      findExpired: jest.fn(),
      deleteByIds: jest.fn(),
    };

    const billingProviderService = {
      getCycleInfo: jest.fn().mockResolvedValue({
        currentPeriodEnd: new Date(Date.now() + 24 * 60 * 60 * 1000),
        provider: 'mock',
      }),
    };

    const service = new BillingService(
      planLimitQueryRepository,
      resumeExportRepository,
      billingProviderService
    );

    return {
      service,
      planLimitQueryRepository,
      resumeExportRepository,
      billingProviderService,
    };
  };

  it('returns early for invalid input', async () => {
    const deps = buildDependencies();

    await expect(deps.service.enforceDailyUploadLimit('', '', 0)).resolves.toBeUndefined();
    expect(deps.planLimitQueryRepository.findByPlanId).not.toHaveBeenCalled();
    expect(deps.resumeExportRepository.getUploadedBytesByUserInRange).not.toHaveBeenCalled();
  });

  it('throws when plan limits are missing', async () => {
    const deps = buildDependencies();
    deps.planLimitQueryRepository.findByPlanId.mockResolvedValue(null);

    await expect(deps.service.enforceDailyUploadLimit('user-1', 'plan-1', 1024)).rejects.toBeInstanceOf(
      ForbiddenError
    );
  });

  it('throws when daily upload limit would be exceeded', async () => {
    const deps = buildDependencies();
    deps.resumeExportRepository.getUploadedBytesByUserInRange.mockResolvedValue(1024 * 1024);

    await expect(deps.service.enforceDailyUploadLimit('user-1', 'plan-1', 1)).rejects.toBeInstanceOf(
      ForbiddenError
    );
  });

  it('allows upload when usage stays within plan limit', async () => {
    const deps = buildDependencies();
    deps.resumeExportRepository.getUploadedBytesByUserInRange.mockResolvedValue(256 * 1024);

    await expect(
      deps.service.enforceDailyUploadLimit('user-1', 'plan-1', 128 * 1024)
    ).resolves.toBeUndefined();
    expect(deps.planLimitQueryRepository.findByPlanId).toHaveBeenCalledWith('plan-1');
    expect(deps.resumeExportRepository.getUploadedBytesByUserInRange).toHaveBeenCalledWith(
      'user-1',
      expect.any(Date),
      expect.any(Date)
    );
  });

  it('resolves user requested schedule directly', async () => {
    const deps = buildDependencies();
    const scheduleAt = new Date(Date.now() + 3600_000);

    const result = await deps.service.resolvePlanChangeSchedule({
      userId: 'user-1',
      currentPlanId: 'plan-1',
      targetPlanId: 'plan-2',
      requestedScheduleAt: scheduleAt,
    });

    expect(result).toEqual({ effectiveAt: scheduleAt, reason: 'user-scheduled' });
    expect(deps.planLimitQueryRepository.findByPlanId).not.toHaveBeenCalled();
  });

  it('schedules downgrade at billing cycle end when target plan is lower', async () => {
    const deps = buildDependencies();
    deps.planLimitQueryRepository.findByPlanId
      .mockResolvedValueOnce({
        id: 'limit-current',
        planId: 'plan-1',
        maxResumes: 10,
        maxExports: 10,
        dailyUploadMb: 10,
        dailyExports: 10,
        dailyExportEmails: 20,
        dailyBulkApplies: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .mockResolvedValueOnce({
        id: 'limit-target',
        planId: 'plan-2',
        maxResumes: 5,
        maxExports: 5,
        dailyUploadMb: 5,
        dailyExports: 10,
        dailyExportEmails: 20,
        dailyBulkApplies: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    const result = await deps.service.resolvePlanChangeSchedule({
      userId: 'user-1',
      currentPlanId: 'plan-1',
      targetPlanId: 'plan-2',
    });

    expect(result.reason).toBe('billing-cycle');
    expect(result.effectiveAt).toBeInstanceOf(Date);
    expect(deps.billingProviderService.getCycleInfo).toHaveBeenCalledWith('user-1');
  });

  it('applies upgrade immediately without billing cycle scheduling', async () => {
    const deps = buildDependencies();
    deps.planLimitQueryRepository.findByPlanId
      .mockResolvedValueOnce({
        id: 'limit-current',
        planId: 'plan-1',
        maxResumes: 5,
        maxExports: 5,
        dailyUploadMb: 5,
        dailyExports: 10,
        dailyExportEmails: 20,
        dailyBulkApplies: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .mockResolvedValueOnce({
        id: 'limit-target',
        planId: 'plan-2',
        maxResumes: 10,
        maxExports: 10,
        dailyUploadMb: 10,
        dailyExports: 10,
        dailyExportEmails: 20,
        dailyBulkApplies: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    const result = await deps.service.resolvePlanChangeSchedule({
      userId: 'user-1',
      currentPlanId: 'plan-1',
      targetPlanId: 'plan-2',
    });

    expect(result).toEqual({ effectiveAt: null, reason: 'immediate' });
    expect(deps.billingProviderService.getCycleInfo).not.toHaveBeenCalled();
  });
});
