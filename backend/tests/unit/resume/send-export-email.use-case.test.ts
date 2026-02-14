import { SendExportEmailUseCase } from '@dist/modules/resume/application/use-cases/send-export-email/send-export-email.use-case';
import {
  ForbiddenError,
  NotFoundError,
  UnexpectedError,
} from '@dist/modules/shared/application/app-error';

describe('SendExportEmailUseCase', () => {
  const request = {
    exportId: 'export-1',
    userId: 'user-1',
    to: 'hr@example.com',
    reason: 'bulk-apply' as const,
    recipient: { email: 'hr@example.com', company: 'ACME' },
  };

  const makeDeps = () => ({
    exportEmailService: { sendEmail: jest.fn().mockResolvedValue(undefined) },
    auditLogService: { log: jest.fn().mockResolvedValue(undefined) },
    planLimitQueryRepository: {
      findByPlanId: jest.fn().mockResolvedValue({
        id: 'limit-1',
        planId: 'plan-1',
        maxResumes: 10,
        maxExports: 100,
        dailyUploadMb: 500,
        dailyExports: 50,
        dailyExportEmails: 50,
        dailyBulkApplies: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    },
    systemLogQueryRepository: {
      countByUserAndActionInRange: jest.fn().mockResolvedValue(0),
      getActionCounts: jest.fn(),
      getActionCountsByReason: jest.fn(),
      hasActionSince: jest.fn(),
      findFailedExportEmailJobs: jest.fn(),
      findFailedExportEmailJobById: jest.fn(),
    },
    resumeExportQueryRepository: {
      findById: jest.fn().mockResolvedValue({
        id: 'export-1',
        status: 'READY',
        url: 'exports/file.pdf',
      }),
      getPaginatedExports: jest.fn(),
      getLatestForResume: jest.fn(),
    },
    userQueryRepository: {
      findById: jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'owner@example.com',
        planId: 'plan-1',
      }),
      findByEmail: jest.fn(),
      findAuthByEmail: jest.fn(),
      getPaginatedUsers: jest.fn(),
      getBasicUsers: jest.fn(),
    },
    storageService: {
      getSignedDownloadUrl: jest.fn().mockResolvedValue('https://cdn/file.pdf'),
      deleteObject: jest.fn(),
    },
    activityService: { log: jest.fn().mockResolvedValue(undefined) },
  });

  const buildUseCase = (deps: ReturnType<typeof makeDeps>) =>
    new SendExportEmailUseCase(
      deps.exportEmailService,
      deps.auditLogService,
      deps.planLimitQueryRepository,
      deps.systemLogQueryRepository,
      deps.resumeExportQueryRepository,
      deps.userQueryRepository,
      deps.storageService,
      deps.activityService
    );

  it('sends export email when export is ready', async () => {
    const d = makeDeps();
    const useCase = buildUseCase(d);

    const result = await useCase.execute(request);

    expect(result.isSuccess).toBe(true);
    expect(d.exportEmailService.sendEmail).toHaveBeenCalledTimes(1);
    expect(d.activityService.log).toHaveBeenCalled();
    expect(d.auditLogService.log).toHaveBeenCalled();
  });

  it('returns not found when export is not ready', async () => {
    const d = makeDeps();
    d.resumeExportQueryRepository.findById.mockResolvedValue({
      id: 'export-1',
      status: 'PROCESSING',
      url: null,
    });

    const useCase = buildUseCase(d);

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
  });

  it('returns not found when export status is not READY even with url', async () => {
    const d = makeDeps();
    d.resumeExportQueryRepository.findById.mockResolvedValue({
      id: 'export-1',
      status: 'PROCESSING',
      url: 'exports/file.pdf',
    });

    const useCase = buildUseCase(d);

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
  });

  it('returns not found when export record has no url', async () => {
    const d = makeDeps();
    d.resumeExportQueryRepository.findById.mockResolvedValue({
      id: 'export-1',
      status: 'READY',
      url: null,
    });

    const useCase = buildUseCase(d);

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
  });

  it('returns not found when export record does not exist', async () => {
    const d = makeDeps();
    d.resumeExportQueryRepository.findById.mockResolvedValue(null);

    const useCase = buildUseCase(d);

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
  });

  it('returns not found when user is missing', async () => {
    const d = makeDeps();
    d.userQueryRepository.findById.mockResolvedValue(null);

    const useCase = buildUseCase(d);

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
  });

  it('returns not found when signed url cannot be generated', async () => {
    const d = makeDeps();
    d.storageService.getSignedDownloadUrl.mockResolvedValue('');

    const useCase = buildUseCase(d);

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
  });

  it('builds attachment-style content when download url is local file', async () => {
    const d = makeDeps();
    d.storageService.getSignedDownloadUrl.mockResolvedValue('file:///tmp/export.pdf');

    const useCase = buildUseCase(d);

    const result = await useCase.execute(request);

    expect(result.isSuccess).toBe(true);
    expect(d.exportEmailService.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Resume Application',
        body: expect.stringContaining('Please find the resume attached'),
      })
    );
  });

  it('returns unexpected error on unknown failure', async () => {
    const d = makeDeps();
    d.storageService.getSignedDownloadUrl.mockRejectedValue(new Error('boom'));

    const useCase = buildUseCase(d);

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });

  it('uses "Unknown error" when a non-error throwable is raised', async () => {
    const d = makeDeps();
    d.exportEmailService.sendEmail.mockRejectedValue('boom');

    const useCase = buildUseCase(d);

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
    expect(d.auditLogService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'export.email.failed',
        metadata: expect.objectContaining({
          error: 'Unknown error',
        }),
      })
    );
  });

  it('returns forbidden when daily email limit is reached', async () => {
    const d = makeDeps();
    d.systemLogQueryRepository.countByUserAndActionInRange.mockResolvedValue(50);

    const useCase = buildUseCase(d);
    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ForbiddenError);
    expect(d.exportEmailService.sendEmail).not.toHaveBeenCalled();
  });
});
