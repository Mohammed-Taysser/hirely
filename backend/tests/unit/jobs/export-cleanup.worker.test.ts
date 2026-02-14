import { failureResult, successResult } from '../../helpers/test-fixtures';

import { SystemActions } from '@dist/modules/system/application/system.actions';

type WorkerInstance = {
  processor: (job: { id: string }) => Promise<void>;
  handlers: Record<string, (...args: unknown[]) => unknown>;
  on: jest.Mock;
};

type LoadedExportCleanupWorker = {
  startExportCleanupWorker: () => WorkerInstance;
  workerInstances: WorkerInstance[];
  workerFactory: jest.Mock;
  queueAdd: jest.Mock;
  cleanupExecute: jest.Mock;
  systemLog: jest.Mock;
  loggerError: jest.Mock;
};

const flushPromises = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

const loadExportCleanupWorker = (): LoadedExportCleanupWorker => {
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

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { startExportCleanupWorker } = require('@dist/jobs/workers/export-cleanup.worker');

  return {
    startExportCleanupWorker,
    workerInstances,
    workerFactory,
    queueAdd,
    cleanupExecute,
    systemLog,
    loggerError,
  };
};

describe('export-cleanup.worker', () => {
  it('schedules repeatable cleanup job and logs success', async () => {
    const { startExportCleanupWorker, queueAdd, systemLog, workerFactory } = loadExportCleanupWorker();

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
    const { startExportCleanupWorker, workerInstances, cleanupExecute, systemLog } =
      loadExportCleanupWorker();
    cleanupExecute.mockResolvedValue(
      successResult({
        scanned: 4,
        deletedRecords: 3,
        deletedFiles: 3,
        failed: 1,
        failures: [{ exportId: 'exp-1', userId: 'user-1', reason: 'storage unavailable' }],
      })
    );

    startExportCleanupWorker();
    await workerInstances[0].processor({ id: 'job-1' });

    expect(cleanupExecute).toHaveBeenCalledWith({ batchSize: 50 });
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
          failed: 1,
        }),
      })
    );
  });

  it('logs and throws when cleanup use-case fails', async () => {
    const { startExportCleanupWorker, workerInstances, cleanupExecute, systemLog } =
      loadExportCleanupWorker();
    cleanupExecute.mockResolvedValue(failureResult(new Error('cleanup failed')));

    startExportCleanupWorker();

    await expect(workerInstances[0].processor({ id: 'job-2' })).rejects.toThrow('cleanup failed');
    expect(systemLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: SystemActions.EXPORT_CLEANUP_RUN_FAILED,
        message: 'cleanup failed',
      })
    );
  });

  it('handles schedule failures, lifecycle logs, and write failures', async () => {
    const { startExportCleanupWorker, queueAdd, workerInstances, systemLog, loggerError, cleanupExecute } =
      loadExportCleanupWorker();
    queueAdd.mockRejectedValue(new Error('schedule failed'));
    const logWriteError = new Error('system log unavailable');
    systemLog.mockRejectedValueOnce(logWriteError);
    cleanupExecute.mockResolvedValue(
      successResult({ scanned: 0, deletedRecords: 0, deletedFiles: 0, failed: 0, failures: [] })
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
});
