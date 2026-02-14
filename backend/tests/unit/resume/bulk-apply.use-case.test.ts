import { BulkApplyUseCase } from '@dist/modules/resume/application/use-cases/bulk-apply/bulk-apply.use-case';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  TooManyRequestsError,
  UnexpectedError,
  ValidationError,
} from '@dist/modules/shared/application/app-error';

describe('BulkApplyUseCase', () => {
  const request = {
    user: { id: 'user-1' },
    input: {
      resumeId: 'resume-1',
      recipients: [
        { email: 'a@example.com', companyName: 'A Co' },
        { email: 'b@example.com', companyName: 'B Co' },
      ],
    },
  };

  const makeDeps = () => ({
    exportService: {
      enforceExportLimit: jest.fn().mockResolvedValue(undefined),
      createExportRecord: jest.fn().mockResolvedValue({ id: 'export-1' }),
      getExportStatus: jest.fn(),
      getExportStatusForResume: jest.fn(),
      generatePdfBuffer: jest.fn(),
      processPdfExport: jest.fn(),
      markReady: jest.fn(),
      markFailed: jest.fn(),
      generateAndStoreExport: jest.fn(),
    },
    exportQueueService: { enqueuePdf: jest.fn().mockResolvedValue(undefined) },
    resumeSnapshotRepository: {
      createSnapshot: jest.fn().mockResolvedValue({ id: 'snapshot-1' }),
    },
    planLimitQueryRepository: {
      findByPlanId: jest.fn().mockResolvedValue({
        id: 'limit-1',
        planId: 'plan-1',
        maxResumes: 10,
        maxExports: 10,
        dailyUploadMb: 100,
        dailyExports: 10,
        dailyExportEmails: 20,
        dailyBulkApplies: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    },
    systemLogQueryRepository: {
      getActionCounts: jest.fn(),
      getActionCountsByReason: jest.fn(),
      countByUserAndActionInRange: jest.fn().mockResolvedValue(0),
      hasActionSince: jest.fn(),
      findFailedExportEmailJobs: jest.fn(),
      findFailedExportEmailJobById: jest.fn(),
    },
    userQueryRepository: {
      findById: jest
        .fn()
        .mockResolvedValue({ id: 'user-1', planId: 'plan-1', plan: { code: 'PRO' } }),
      findByEmail: jest.fn(),
      findAuthByEmail: jest.fn(),
      getPaginatedUsers: jest.fn(),
      getBasicUsers: jest.fn(),
    },
    rateLimiter: { consume: jest.fn().mockResolvedValue(true) },
    emailQueueService: { enqueue: jest.fn().mockResolvedValue(undefined) },
    systemLogService: { log: jest.fn() },
    auditLogService: { log: jest.fn() },
  });

  const createUseCase = (d: ReturnType<typeof makeDeps>) =>
    new BulkApplyUseCase(
      d.exportService,
      d.exportQueueService,
      d.resumeSnapshotRepository,
      d.planLimitQueryRepository,
      d.systemLogQueryRepository,
      d.userQueryRepository,
      d.rateLimiter,
      d.emailQueueService,
      { max: 2, windowSeconds: 60 },
      d.systemLogService,
      d.auditLogService
    );

  it('returns rate-limit error when limiter rejects request', async () => {
    const d = makeDeps();
    d.rateLimiter.consume.mockResolvedValue(false);

    const result = await createUseCase(d).execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(TooManyRequestsError);
  });

  it('returns not found when snapshot does not exist', async () => {
    const d = makeDeps();
    d.resumeSnapshotRepository.createSnapshot.mockResolvedValue(null);

    const result = await createUseCase(d).execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
  });

  it('returns not found when user plan data is missing', async () => {
    const d = makeDeps();
    d.userQueryRepository.findById.mockResolvedValue({ id: 'user-1', planId: null, plan: null });

    const result = await createUseCase(d).execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
  });

  it('returns not found when plan code is empty string', async () => {
    const d = makeDeps();
    d.userQueryRepository.findById.mockResolvedValue({
      id: 'user-1',
      planId: 'plan-1',
      plan: { code: '' },
    });

    const result = await createUseCase(d).execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
  });

  it('returns forbidden when daily bulk apply limit is reached', async () => {
    const d = makeDeps();
    d.planLimitQueryRepository.findByPlanId.mockResolvedValue({
      id: 'limit-1',
      planId: 'plan-1',
      maxResumes: 10,
      maxExports: 10,
      dailyUploadMb: 100,
        dailyExports: 10,
        dailyExportEmails: 20,
        dailyBulkApplies: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    d.systemLogQueryRepository.countByUserAndActionInRange.mockResolvedValue(1);

    const result = await createUseCase(d).execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ForbiddenError);
    expect(d.exportService.enforceExportLimit).not.toHaveBeenCalled();
  });

  it('enqueues export and emails all recipients', async () => {
    const d = makeDeps();

    const result = await createUseCase(d).execute(request);

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().exportId).toBe('export-1');
    expect(d.emailQueueService.enqueue).toHaveBeenCalledTimes(2);
    expect(d.exportQueueService.enqueuePdf).toHaveBeenCalledWith({
      exportId: 'export-1',
      snapshotId: 'snapshot-1',
      userId: 'user-1',
    });
  });

  it('returns unexpected error on unknown exception', async () => {
    const d = makeDeps();
    d.exportService.enforceExportLimit.mockRejectedValue(new Error('boom'));

    const result = await createUseCase(d).execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });

  it('returns original app error when thrown inside execute', async () => {
    const d = makeDeps();
    d.exportService.enforceExportLimit.mockRejectedValue(new ConflictError('limit conflict'));

    const result = await createUseCase(d).execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ConflictError);
  });

  it('logs Unknown error message when thrown value is not Error', async () => {
    const d = makeDeps();
    d.exportService.enforceExportLimit.mockRejectedValue('boom');

    const result = await createUseCase(d).execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
    expect(d.systemLogService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: expect.any(String),
        message: 'Unknown error',
      })
    );
  });

  it('throws validation error for blank plan code in guard helper', () => {
    const d = makeDeps();
    const useCase = createUseCase(d) as unknown as { ensureBulkApplyAllowed: (planCode: string) => void };

    expect(() => useCase.ensureBulkApplyAllowed('')).toThrow(ValidationError);
  });
});
