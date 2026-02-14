import { EnqueueResumeExportUseCase } from '@dist/modules/resume/application/use-cases/enqueue-resume-export/enqueue-resume-export.use-case';
import {
  ConflictError,
  NotFoundError,
  TooManyRequestsError,
  UnexpectedError,
} from '@dist/modules/shared/application/app-error';

describe('EnqueueResumeExportUseCase', () => {
  const baseRequest = { user: { id: 'user-1' }, resumeId: 'resume-1' };

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
    userQueryRepository: {
      findById: jest.fn().mockResolvedValue({
        id: 'user-1',
        planId: 'plan-1',
        plan: { code: 'PRO' },
      }),
      findByEmail: jest.fn(),
      findAuthByEmail: jest.fn(),
      getPaginatedUsers: jest.fn(),
      getBasicUsers: jest.fn(),
    },
    rateLimiter: { consume: jest.fn().mockResolvedValue(true) },
    systemLogService: { log: jest.fn() },
    auditLogService: { log: jest.fn() },
  });

  it('returns rate-limit error when limiter denies request', async () => {
    const d = makeDeps();
    d.rateLimiter.consume.mockResolvedValue(false);

    const useCase = new EnqueueResumeExportUseCase(
      d.exportService,
      d.exportQueueService,
      d.resumeSnapshotRepository,
      d.userQueryRepository,
      d.rateLimiter,
      d.systemLogService,
      d.auditLogService
    );

    const result = await useCase.execute(baseRequest);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(TooManyRequestsError);
  });

  it('returns not found when user plan is missing', async () => {
    const d = makeDeps();
    d.userQueryRepository.findById.mockResolvedValue({ id: 'user-1', planId: null, plan: null });

    const useCase = new EnqueueResumeExportUseCase(
      d.exportService,
      d.exportQueueService,
      d.resumeSnapshotRepository,
      d.userQueryRepository,
      d.rateLimiter,
      d.systemLogService,
      d.auditLogService
    );

    const result = await useCase.execute(baseRequest);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
  });

  it('returns not found when snapshot is missing', async () => {
    const d = makeDeps();
    d.resumeSnapshotRepository.createSnapshot.mockResolvedValue(null);

    const useCase = new EnqueueResumeExportUseCase(
      d.exportService,
      d.exportQueueService,
      d.resumeSnapshotRepository,
      d.userQueryRepository,
      d.rateLimiter,
      d.systemLogService,
      d.auditLogService
    );

    const result = await useCase.execute(baseRequest);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
  });

  it('enqueues export and returns delivery mode', async () => {
    const d = makeDeps();

    const useCase = new EnqueueResumeExportUseCase(
      d.exportService,
      d.exportQueueService,
      d.resumeSnapshotRepository,
      d.userQueryRepository,
      d.rateLimiter,
      d.systemLogService,
      d.auditLogService
    );

    const result = await useCase.execute(baseRequest);

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual({ exportId: 'export-1', delivery: 'download' });
    expect(d.exportQueueService.enqueuePdf).toHaveBeenCalledWith({
      exportId: 'export-1',
      snapshotId: 'snapshot-1',
      userId: 'user-1',
    });
  });

  it('returns email delivery for non-download plans', async () => {
    const d = makeDeps();
    d.userQueryRepository.findById.mockResolvedValue({
      id: 'user-1',
      planId: 'plan-1',
      plan: { code: 'FREE' },
    });

    const useCase = new EnqueueResumeExportUseCase(
      d.exportService,
      d.exportQueueService,
      d.resumeSnapshotRepository,
      d.userQueryRepository,
      d.rateLimiter,
      d.systemLogService,
      d.auditLogService
    );

    const result = await useCase.execute(baseRequest);

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual({ exportId: 'export-1', delivery: 'email' });
  });

  it('returns unexpected error for unhandled exceptions', async () => {
    const d = makeDeps();
    d.exportService.enforceExportLimit.mockRejectedValue(new Error('boom'));

    const useCase = new EnqueueResumeExportUseCase(
      d.exportService,
      d.exportQueueService,
      d.resumeSnapshotRepository,
      d.userQueryRepository,
      d.rateLimiter,
      d.systemLogService,
      d.auditLogService
    );

    const result = await useCase.execute(baseRequest);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });

  it('returns original app error when one is thrown inside execute', async () => {
    const d = makeDeps();
    d.exportService.enforceExportLimit.mockRejectedValue(new ConflictError('plan conflict'));

    const useCase = new EnqueueResumeExportUseCase(
      d.exportService,
      d.exportQueueService,
      d.resumeSnapshotRepository,
      d.userQueryRepository,
      d.rateLimiter,
      d.systemLogService,
      d.auditLogService
    );

    const result = await useCase.execute(baseRequest);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ConflictError);
  });

  it('logs Unknown error when thrown value is not Error', async () => {
    const d = makeDeps();
    d.exportService.enforceExportLimit.mockRejectedValue('boom');

    const useCase = new EnqueueResumeExportUseCase(
      d.exportService,
      d.exportQueueService,
      d.resumeSnapshotRepository,
      d.userQueryRepository,
      d.rateLimiter,
      d.systemLogService,
      d.auditLogService
    );

    const result = await useCase.execute(baseRequest);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
    expect(d.systemLogService.log).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Unknown error' })
    );
  });
});
