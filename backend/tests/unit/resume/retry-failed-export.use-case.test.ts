import { RetryFailedExportUseCase } from '@dist/modules/resume/application/use-cases/retry-failed-export/retry-failed-export.use-case';
import {
  ConflictError,
  NotFoundError,
  TooManyRequestsError,
  UnexpectedError,
} from '@dist/modules/shared/application/app-error';

describe('RetryFailedExportUseCase', () => {
  const makeDeps = () => ({
    resumeExportQueryRepository: {
      findById: jest.fn().mockResolvedValue({
        id: 'export-1',
        resumeId: 'resume-1',
        snapshotId: 'snapshot-1',
        userId: 'user-1',
        idempotencyKey: null,
        status: 'FAILED',
        url: null,
        sizeBytes: null,
        error: 'failed',
        expiresAt: null,
        createdAt: new Date('2026-02-14T00:00:00.000Z'),
        updatedAt: new Date('2026-02-14T00:00:00.000Z'),
      }),
      getPaginatedExports: jest.fn(),
      getFailedExportsByUser: jest.fn(),
      findByIdForResume: jest.fn(),
      findByIdempotencyKey: jest.fn(),
    },
    resumeExportRepository: {
      markPending: jest.fn().mockResolvedValue(undefined),
      create: jest.fn(),
      markReady: jest.fn(),
      markFailed: jest.fn(),
      countByUser: jest.fn(),
      getUploadedBytesByUserInRange: jest.fn(),
      findExpired: jest.fn(),
      deleteByIds: jest.fn(),
    },
    exportQueueService: { enqueuePdf: jest.fn().mockResolvedValue(undefined) },
    rateLimiter: { consume: jest.fn().mockResolvedValue(true) },
    systemLogService: { log: jest.fn().mockResolvedValue(undefined) },
    auditLogService: { log: jest.fn().mockResolvedValue(undefined) },
  });

  const createUseCase = (d: ReturnType<typeof makeDeps>) =>
    new RetryFailedExportUseCase(
      d.resumeExportQueryRepository,
      d.resumeExportRepository,
      d.exportQueueService,
      d.rateLimiter,
      { max: 10, windowSeconds: 3600 },
      d.systemLogService,
      d.auditLogService
    );

  it('requeues failed export and returns pending status', async () => {
    const d = makeDeps();
    const useCase = createUseCase(d);

    const result = await useCase.execute({ userId: 'user-1', exportId: 'export-1' });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual({ exportId: 'export-1', status: 'PENDING' });
    expect(d.resumeExportRepository.markPending).toHaveBeenCalledWith('export-1');
    expect(d.exportQueueService.enqueuePdf).toHaveBeenCalledWith({
      exportId: 'export-1',
      snapshotId: 'snapshot-1',
      userId: 'user-1',
    });
  });

  it('returns too many requests when retry rate limit is exceeded', async () => {
    const d = makeDeps();
    d.rateLimiter.consume.mockResolvedValue(false);
    const useCase = createUseCase(d);

    const result = await useCase.execute({ userId: 'user-1', exportId: 'export-1' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(TooManyRequestsError);
  });

  it('returns not found when export does not exist', async () => {
    const d = makeDeps();
    d.resumeExportQueryRepository.findById.mockResolvedValue(null);
    const useCase = createUseCase(d);

    const result = await useCase.execute({ userId: 'user-1', exportId: 'missing' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
  });

  it('returns conflict when export is not failed', async () => {
    const d = makeDeps();
    d.resumeExportQueryRepository.findById.mockResolvedValue({
      id: 'export-1',
      resumeId: 'resume-1',
      snapshotId: 'snapshot-1',
      userId: 'user-1',
      idempotencyKey: null,
      status: 'READY',
      url: 'uploads/file.pdf',
      sizeBytes: 1024,
      error: null,
      expiresAt: null,
      createdAt: new Date('2026-02-14T00:00:00.000Z'),
      updatedAt: new Date('2026-02-14T00:00:00.000Z'),
    });
    const useCase = createUseCase(d);

    const result = await useCase.execute({ userId: 'user-1', exportId: 'export-1' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ConflictError);
  });

  it('returns unexpected error for unhandled exceptions', async () => {
    const d = makeDeps();
    d.exportQueueService.enqueuePdf.mockRejectedValue(new Error('queue down'));
    const useCase = createUseCase(d);

    const result = await useCase.execute({ userId: 'user-1', exportId: 'export-1' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
    expect(d.systemLogService.log).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'queue down' })
    );
  });
});
