import { failureResult, successResult } from '../../helpers/test-fixtures';

import { SystemActions } from '@dist/modules/system/application/system.actions';

type WorkerInstance = {
  processor: (job: { id: string }) => Promise<void>;
  handlers: Record<string, (...args: unknown[]) => unknown>;
  on: jest.Mock;
};

type LoadedExportCleanupWorker = {
  startExportCleanupWorker: () => unknown;
  workerInstances: WorkerInstance[];
  workerFactory: jest.Mock;
  queueAdd: jest.Mock;
  cleanupExecute: jest.Mock;
  evaluateAlertsExecute: jest.Mock;
  systemLog: jest.Mock;
  loggerError: jest.Mock;
};

const flushPromises = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

const loadExportCleanupWorker = async (): Promise<LoadedExportCleanupWorker> => {
  jest.resetModules();

  const workerInstances: WorkerInstance[] = [];
  const workerFactory = jest.fn().mockImplementation((_queueName, processor) => {
    const handlers: Record<string, (...args: unknown[]) => unknown> = {};
    const worker = {
      processor,
      handlers,
      on: jest.fn((event: string, handler: (...args: unknown[]) => unknown) => {
        handlers[event] = handler;
        return worker;
      }),
    } as WorkerInstance;

    workerInstances.push(worker);
    return worker;
  });

  const queueAdd = jest.fn().mockResolvedValue(undefined);
  const cleanupExecute = jest.fn();
  const evaluateAlertsExecute = jest.fn().mockResolvedValue(
    successResult({
      windowMinutes: 60,
      minEvents: 20,
      thresholdRatio: 0.25,
      cooldownSeconds: 900,
      pdf: {
        total: 0,
        failed: 0,
        failureRatio: 0,
        thresholdExceeded: false,
        triggered: false,
        suppressedByCooldown: false,
      },
      email: {
        total: 0,
        failed: 0,
        failureRatio: 0,
        thresholdExceeded: false,
        triggered: false,
        suppressedByCooldown: false,
      },
    })
  );
  const systemLog = jest.fn().mockResolvedValue(undefined);
  const loggerError = jest.fn();

  jest.doMock('bullmq', () => ({
    __esModule: true,
    Worker: workerFactory,
  }));
  jest.doMock('@dist/apps/config', () => ({
    __esModule: true,
    default: {
      EXPORT_CLEANUP_INTERVAL_SECONDS: 600,
      EXPORT_CLEANUP_BATCH_SIZE: 50,
      EXPORT_CLEANUP_DRY_RUN: false,
    },
  }));
  jest.doMock('@dist/apps/constant', () => ({
    __esModule: true,
    QUEUE_NAMES: { exportCleanup: 'export-cleanup' },
  }));
  jest.doMock('@dist/apps/redis', () => ({
    __esModule: true,
    redisConnectionOptions: { host: 'localhost', port: 6379 },
  }));
  jest.doMock('@dist/apps/worker-containers/export-cleanup-worker.container', () => ({
    __esModule: true,
    cleanupExpiredExportsUseCase: {
      execute: (...args: unknown[]) => cleanupExecute(...args),
    },
    evaluateExportFailureAlertsUseCase: {
      execute: (...args: unknown[]) => evaluateAlertsExecute(...args),
    },
    systemLogService: {
      log: (...args: unknown[]) => systemLog(...args),
    },
  }));
  jest.doMock('@dist/jobs/queues/export-cleanup.queue', () => ({
    __esModule: true,
    default: {
      add: (...args: unknown[]) => queueAdd(...args),
    },
  }));
  jest.doMock('@dist/shared/logger', () => ({
    __esModule: true,
    logger: {
      error: (...args: unknown[]) => loggerError(...args),
    },
  }));

  const { startExportCleanupWorker } = await import('@dist/jobs/workers/export-cleanup.worker');

  return {
    startExportCleanupWorker,
    workerInstances,
    workerFactory,
    queueAdd,
    cleanupExecute,
    evaluateAlertsExecute,
    systemLog,
    loggerError,
  };
};

describe('export-cleanup.worker', () => {
  it('schedules repeatable cleanup job and logs success', async () => {
    const { startExportCleanupWorker, queueAdd, systemLog, workerFactory } =
      await loadExportCleanupWorker();

    startExportCleanupWorker();
    await flushPromises();

    expect(queueAdd).toHaveBeenCalledWith(
      'cleanup-expired-exports',
      {},
      expect.objectContaining({
        repeat: { every: 600000 },
      })
    );
    expect(systemLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: SystemActions.EXPORT_CLEANUP_SCHEDULED,
        metadata: expect.objectContaining({
          intervalSeconds: 600,
          batchSize: 50,
          dryRun: false,
        }),
      })
    );
    expect(workerFactory).toHaveBeenCalledWith(
      'export-cleanup',
      expect.any(Function),
      expect.objectContaining({ connection: { host: 'localhost', port: 6379 } })
    );
  });

  it('executes cleanup and logs completion metadata', async () => {
    const { startExportCleanupWorker, workerInstances, cleanupExecute, evaluateAlertsExecute, systemLog } =
      await loadExportCleanupWorker();
    cleanupExecute.mockResolvedValue(
      successResult({
        scanned: 4,
        deletedRecords: 3,
        deletedFiles: 3,
        wouldDeleteRecords: 4,
        wouldDeleteFiles: 4,
        dryRun: false,
        failed: 1,
        failures: [{ exportId: 'exp-1', userId: 'user-1', reason: 'storage unavailable' }],
      })
    );

    startExportCleanupWorker();
    await workerInstances[0].processor({ id: 'job-1' });

    expect(cleanupExecute).toHaveBeenCalledWith({ batchSize: 50, dryRun: false });
    expect(evaluateAlertsExecute).toHaveBeenCalledWith({});
    expect(systemLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: SystemActions.EXPORT_CLEANUP_RUN_STARTED })
    );
    expect(systemLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: SystemActions.EXPORT_CLEANUP_RUN_COMPLETED,
        level: 'warn',
        metadata: expect.objectContaining({
          jobId: 'job-1',
          scanned: 4,
          deletedRecords: 3,
          wouldDeleteRecords: 4,
          dryRun: false,
          failed: 1,
          alerts: expect.any(Object),
        }),
      })
    );
  });

  it('logs and throws when cleanup use-case fails', async () => {
    const { startExportCleanupWorker, workerInstances, cleanupExecute, evaluateAlertsExecute, systemLog } =
      await loadExportCleanupWorker();
    cleanupExecute.mockResolvedValue(failureResult(new Error('cleanup failed')));

    startExportCleanupWorker();

    await expect(workerInstances[0].processor({ id: 'job-2' })).rejects.toThrow('cleanup failed');
    expect(evaluateAlertsExecute).not.toHaveBeenCalled();
    expect(systemLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: SystemActions.EXPORT_CLEANUP_RUN_FAILED,
        message: 'cleanup failed',
      })
    );
  });

  it('handles schedule failures, lifecycle logs, and write failures', async () => {
    const { startExportCleanupWorker, queueAdd, workerInstances, systemLog, loggerError, cleanupExecute } =
      await loadExportCleanupWorker();
    queueAdd.mockRejectedValue(new Error('schedule failed'));
    const logWriteError = new Error('system log unavailable');
    systemLog.mockRejectedValueOnce(logWriteError);
    cleanupExecute.mockResolvedValue(
      successResult({
        scanned: 0,
        deletedRecords: 0,
        deletedFiles: 0,
        wouldDeleteRecords: 0,
        wouldDeleteFiles: 0,
        dryRun: false,
        failed: 0,
        failures: [],
      })
    );

    startExportCleanupWorker();
    await flushPromises();

    expect(systemLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: SystemActions.EXPORT_CLEANUP_SCHEDULE_FAILED,
        message: 'schedule failed',
      })
    );

    systemLog.mockRejectedValueOnce(logWriteError);
    workerInstances[0].handlers.ready();
    await flushPromises();
    expect(loggerError).toHaveBeenCalledWith('Failed to write system log', {
      error: expect.any(Error),
    });

    workerInstances[0].handlers.failed({ id: 'job-3' }, new Error('run failed'));
    expect(systemLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: SystemActions.WORKER_EXPORT_CLEANUP_FAILED,
        message: 'run failed',
      })
    );
  });

  it('logs alert evaluation failure but still completes cleanup log', async () => {
    const { startExportCleanupWorker, workerInstances, cleanupExecute, evaluateAlertsExecute, systemLog } =
      await loadExportCleanupWorker();
    cleanupExecute.mockResolvedValue(
      successResult({
        scanned: 1,
        deletedRecords: 1,
        deletedFiles: 1,
        wouldDeleteRecords: 1,
        wouldDeleteFiles: 1,
        dryRun: false,
        failed: 0,
        failures: [],
      })
    );
    evaluateAlertsExecute.mockResolvedValue(failureResult(new Error('alert query failed')));

    startExportCleanupWorker();
    await workerInstances[0].processor({ id: 'job-4' });

    expect(systemLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: SystemActions.EXPORT_ALERT_EVALUATION_FAILED,
        message: 'alert query failed',
      })
    );
    expect(systemLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: SystemActions.EXPORT_CLEANUP_RUN_COMPLETED,
      })
    );
  });
});
