import { GetUserPlanUsageUseCase } from '@dist/modules/user/application/use-cases/get-user-plan-usage/get-user-plan-usage.use-case';
import { ForbiddenError, NotFoundError, UnexpectedError } from '@dist/modules/shared/application/app-error';

describe('GetUserPlanUsageUseCase', () => {
  const buildDependencies = () => {
    const userQueryRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 'user-1',
        planId: 'plan-1',
        plan: { id: 'plan-1', code: 'PRO', name: 'Pro' },
      }),
      getPaginatedUsers: jest.fn(),
      getBasicUsers: jest.fn(),
      findAuthByEmail: jest.fn(),
    };

    const planLimitQueryRepository = {
      findByPlanId: jest.fn().mockResolvedValue({
        id: 'limit-1',
        planId: 'plan-1',
        maxResumes: 10,
        maxExports: 20,
        dailyUploadMb: 100,
        dailyExports: 10,
        dailyExportEmails: 20,
        dailyBulkApplies: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    };

    const resumeQueryRepository = {
      getBasicResumes: jest.fn().mockResolvedValue([{ id: 'resume-1', name: 'A', isDefault: true }]),
      findById: jest.fn(),
      findByIdForExport: jest.fn(),
      getPaginatedResumes: jest.fn(),
      getPaginatedSnapshots: jest.fn(),
    };

    const resumeExportRepository = {
      countByUser: jest.fn().mockResolvedValue(3),
      countByUserInRange: jest.fn().mockResolvedValue(2),
      getUploadedBytesByUserInRange: jest.fn().mockResolvedValue(2048),
      create: jest.fn(),
      markReady: jest.fn(),
      markFailed: jest.fn(),
      findExpired: jest.fn(),
      deleteByIds: jest.fn(),
    };

    const systemLogQueryRepository = {
      getActionCounts: jest.fn(),
      getActionCountsByReason: jest.fn(),
      countByUserAndActionInRange: jest
        .fn()
        .mockResolvedValueOnce(6)
        .mockResolvedValueOnce(4),
      hasActionSince: jest.fn(),
      findFailedExportEmailJobs: jest.fn(),
      findFailedExportEmailJobById: jest.fn(),
    };

    const useCase = new GetUserPlanUsageUseCase(
      userQueryRepository,
      planLimitQueryRepository,
      resumeQueryRepository,
      resumeExportRepository,
      systemLogQueryRepository
    );

    return {
      useCase,
      userQueryRepository,
      planLimitQueryRepository,
      resumeQueryRepository,
      resumeExportRepository,
      systemLogQueryRepository,
    };
  };

  it('returns plan usage summary', async () => {
    const deps = buildDependencies();

    const result = await deps.useCase.execute({ userId: 'user-1' });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual(
      expect.objectContaining({
        plan: { id: 'plan-1', code: 'PRO', name: 'Pro' },
        limits: expect.objectContaining({
          maxResumes: 10,
          maxExports: 20,
          dailyUploadMb: 100,
          dailyUploadBytes: 104857600,
          dailyExports: 10,
          dailyExportEmails: 20,
          dailyBulkApplies: 20,
        }),
        usage: {
          resumesUsed: 1,
          exportsUsed: 3,
          dailyExportsUsed: 2,
          dailyUploadUsedBytes: 2048,
          dailyExportEmailsUsed: 6,
          dailyBulkAppliesUsed: 4,
        },
        remaining: {
          resumes: 9,
          exports: 17,
          dailyExports: 8,
          dailyUploadBytes: 104855552,
          dailyExportEmails: 14,
          dailyBulkApplies: 16,
        },
      })
    );
  });

  it('returns not found when user plan is missing', async () => {
    const deps = buildDependencies();
    deps.userQueryRepository.findById.mockResolvedValue({ id: 'user-1', planId: null, plan: null });

    const result = await deps.useCase.execute({ userId: 'user-1' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
  });

  it('returns forbidden when plan limits are missing', async () => {
    const deps = buildDependencies();
    deps.planLimitQueryRepository.findByPlanId.mockResolvedValue(null);

    const result = await deps.useCase.execute({ userId: 'user-1' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ForbiddenError);
  });

  it('clamps remaining values at zero when usage exceeds limits', async () => {
    const deps = buildDependencies();
    deps.planLimitQueryRepository.findByPlanId.mockResolvedValue({
      id: 'limit-1',
      planId: 'plan-1',
      maxResumes: 1,
      maxExports: 1,
      dailyUploadMb: 1,
      dailyExports: 1,
      dailyExportEmails: 1,
      dailyBulkApplies: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    deps.resumeQueryRepository.getBasicResumes.mockResolvedValue([
      { id: 'resume-1', name: 'A', isDefault: true },
      { id: 'resume-2', name: 'B', isDefault: false },
    ]);
    deps.resumeExportRepository.countByUser.mockResolvedValue(3);
    deps.resumeExportRepository.countByUserInRange.mockResolvedValue(3);
    deps.resumeExportRepository.getUploadedBytesByUserInRange.mockResolvedValue(2 * 1024 * 1024);
    deps.systemLogQueryRepository.countByUserAndActionInRange
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(3);

    const result = await deps.useCase.execute({ userId: 'user-1' });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().remaining).toEqual({
      resumes: 0,
      exports: 0,
      dailyExports: 0,
      dailyUploadBytes: 0,
      dailyExportEmails: 0,
      dailyBulkApplies: 0,
    });
  });

  it('wraps unknown errors', async () => {
    const deps = buildDependencies();
    deps.resumeExportRepository.countByUser.mockRejectedValue(new Error('boom'));

    const result = await deps.useCase.execute({ userId: 'user-1' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });
});
