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

    const service = new BillingService(planLimitQueryRepository, resumeExportRepository);

    return {
      service,
      planLimitQueryRepository,
      resumeExportRepository,
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
});
