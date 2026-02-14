import { RetryFailedExportEmailJobUseCase } from '@dist/modules/resume/application/use-cases/retry-failed-export-email-job/retry-failed-export-email-job.use-case';
import {
  ConflictError,
  NotFoundError,
  TooManyRequestsError,
  ValidationError,
} from '@dist/modules/shared/application/app-error';

describe('RetryFailedExportEmailJobUseCase', () => {
  const makeDeps = () => ({
    systemLogQueryRepository: {
      findFailedExportEmailJobById: jest.fn().mockResolvedValue({
        id: 'log-1',
        action: 'export.email.failed',
        message: 'email failed',
        metadata: {
          exportId: 'export-1',
          to: 'person@example.com',
          reason: 'free-tier-export',
        },
        createdAt: new Date('2026-02-14T00:00:00.000Z'),
      }),
      getActionCounts: jest.fn(),
      hasActionSince: jest.fn(),
      findFailedExportEmailJobs: jest.fn(),
    },
    resumeExportQueryRepository: {
      findById: jest.fn().mockResolvedValue({
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
      }),
      getPaginatedExports: jest.fn(),
      getFailedExportsByUser: jest.fn(),
      findByIdForResume: jest.fn(),
      findByIdempotencyKey: jest.fn(),
    },
    exportEmailQueueService: { enqueue: jest.fn().mockResolvedValue(undefined) },
    bulkApplyEmailQueueService: { enqueue: jest.fn().mockResolvedValue(undefined) },
    rateLimiter: { consume: jest.fn().mockResolvedValue(true) },
    systemLogService: { log: jest.fn().mockResolvedValue(undefined) },
    auditLogService: { log: jest.fn().mockResolvedValue(undefined) },
  });

  const createUseCase = (d: ReturnType<typeof makeDeps>) =>
    new RetryFailedExportEmailJobUseCase(
      d.systemLogQueryRepository,
      d.resumeExportQueryRepository,
      d.exportEmailQueueService,
      d.bulkApplyEmailQueueService,
      d.rateLimiter,
      { max: 10, windowSeconds: 3600 },
      d.systemLogService,
      d.auditLogService
    );

  it('requeues failed free-tier email job', async () => {
    const d = makeDeps();
    const useCase = createUseCase(d);

    const result = await useCase.execute({ userId: 'user-1', failedJobId: 'log-1' });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual({
      failedJobId: 'log-1',
      exportId: 'export-1',
      to: 'person@example.com',
      reason: 'free-tier-export',
    });
    expect(d.exportEmailQueueService.enqueue).toHaveBeenCalledWith({
      exportId: 'export-1',
      userId: 'user-1',
      to: 'person@example.com',
      reason: 'free-tier-export',
      recipient: undefined,
    });
  });

  it('requeues failed bulk-apply email job', async () => {
    const d = makeDeps();
    d.systemLogQueryRepository.findFailedExportEmailJobById.mockResolvedValue({
      id: 'log-1',
      action: 'export.email.failed',
      message: 'email failed',
      metadata: {
        exportId: 'export-1',
        to: 'person@example.com',
        reason: 'bulk-apply',
        recipient: { name: 'Hiring Manager' },
      },
      createdAt: new Date('2026-02-14T00:00:00.000Z'),
    });
    const useCase = createUseCase(d);

    const result = await useCase.execute({ userId: 'user-1', failedJobId: 'log-1' });

    expect(result.isSuccess).toBe(true);
    expect(d.bulkApplyEmailQueueService.enqueue).toHaveBeenCalledWith({
      exportId: 'export-1',
      userId: 'user-1',
      to: 'person@example.com',
      reason: 'bulk-apply',
      recipient: {
        email: 'person@example.com',
        name: 'Hiring Manager',
        company: undefined,
        message: undefined,
      },
    });
  });

  it('returns too many requests when retry rate limit is exceeded', async () => {
    const d = makeDeps();
    d.rateLimiter.consume.mockResolvedValue(false);
    const useCase = createUseCase(d);

    const result = await useCase.execute({ userId: 'user-1', failedJobId: 'log-1' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(TooManyRequestsError);
  });

  it('returns not found when failed log does not exist', async () => {
    const d = makeDeps();
    d.systemLogQueryRepository.findFailedExportEmailJobById.mockResolvedValue(null);
    const useCase = createUseCase(d);

    const result = await useCase.execute({ userId: 'user-1', failedJobId: 'log-missing' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
  });

  it('returns validation error when failed log metadata is incomplete', async () => {
    const d = makeDeps();
    d.systemLogQueryRepository.findFailedExportEmailJobById.mockResolvedValue({
      id: 'log-1',
      action: 'export.email.failed',
      message: 'email failed',
      metadata: { exportId: 'export-1' },
      createdAt: new Date('2026-02-14T00:00:00.000Z'),
    });
    const useCase = createUseCase(d);

    const result = await useCase.execute({ userId: 'user-1', failedJobId: 'log-1' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ValidationError);
  });

  it('returns conflict when export is not ready', async () => {
    const d = makeDeps();
    d.resumeExportQueryRepository.findById.mockResolvedValue({
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
    });
    const useCase = createUseCase(d);

    const result = await useCase.execute({ userId: 'user-1', failedJobId: 'log-1' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ConflictError);
  });
});
