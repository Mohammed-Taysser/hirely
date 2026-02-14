import { failureResult, successResult } from '../../helpers/test-fixtures';

import { SystemActions } from '@dist/modules/system/application/system.actions';

type WorkerInstance = {
  queueName: string;
  processor: (job: { id: string; data: Record<string, unknown> }) => Promise<void>;
  options: unknown;
  handlers: Record<string, (...args: unknown[]) => unknown>;
  close: jest.Mock;
  on: jest.Mock;
};

type LoadedPdfWorker = {
  startPdfWorker: () => WorkerInstance;
  workerInstances: WorkerInstance[];
  workerFactory: jest.Mock;
  execute: jest.Mock;
  systemLog: jest.Mock;
  loggerError: jest.Mock;
};

const loadPdfWorker = (): LoadedPdfWorker => {
  jest.resetModules();

  const workerInstances: WorkerInstance[] = [];
  const workerFactory = jest.fn().mockImplementation((queueName, processor, options) => {
    const handlers: Record<string, (...args: unknown[]) => unknown> = {};
    const worker = {
      queueName,
      processor,
      options,
      handlers,
      close: jest.fn(),
      on: jest.fn((event: string, handler: (...args: unknown[]) => unknown) => {
        handlers[event] = handler;
        return worker;
      }),
    } as WorkerInstance;

    workerInstances.push(worker);
    return worker;
  });

  const execute = jest.fn();
  const systemLog = jest.fn().mockResolvedValue(undefined);
  const loggerError = jest.fn();
  const redisConnectionOptions = { host: 'localhost', port: 6379 };

  jest.doMock('bullmq', () => ({
    __esModule: true,
    Worker: workerFactory,
  }));
  jest.doMock('@dist/apps/worker-containers/pdf-worker.container', () => ({
    __esModule: true,
    processExportPdfUseCase: {
      execute: (...args: unknown[]) => execute(...args),
    },
    systemLogService: {
      log: (...args: unknown[]) => systemLog(...args),
    },
  }));
  jest.doMock('@dist/apps/redis', () => ({
    __esModule: true,
    redisConnectionOptions,
  }));
  jest.doMock('@dist/shared/logger', () => ({
    __esModule: true,
    logger: {
      error: (...args: unknown[]) => loggerError(...args),
    },
  }));

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { startPdfWorker } = require('@dist/jobs/workers/pdf.worker');

  return {
    startPdfWorker,
    workerInstances,
    workerFactory,
    execute,
    systemLog,
    loggerError,
  };
};

describe('pdf.worker', () => {
  it('creates worker and registers lifecycle handlers', () => {
    const { startPdfWorker, workerFactory, workerInstances } = loadPdfWorker();

    const worker = startPdfWorker();

    expect(workerFactory).toHaveBeenCalledWith(
      'pdf-generation',
      expect.any(Function),
      expect.objectContaining({
        connection: { host: 'localhost', port: 6379 },
      })
    );

    const instance = workerInstances[0];
    expect(instance.on).toHaveBeenCalledWith('ready', expect.any(Function));
    expect(instance.on).toHaveBeenCalledWith('completed', expect.any(Function));
    expect(instance.on).toHaveBeenCalledWith('failed', expect.any(Function));
    expect(worker).toBe(instance);
  });

  it('processes job and logs processing and success actions', async () => {
    const { startPdfWorker, workerInstances, execute, systemLog } = loadPdfWorker();
    execute.mockResolvedValue(successResult(undefined));

    startPdfWorker();
    const worker = workerInstances[0];

    await worker.processor({
      id: 'job-1',
      data: { exportId: 'export-1', snapshotId: 'snapshot-1', userId: 'user-1' },
    });

    expect(execute).toHaveBeenCalledWith({
      exportId: 'export-1',
      snapshotId: 'snapshot-1',
      userId: 'user-1',
    });
    expect(systemLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: SystemActions.EXPORT_PDF_PROCESSING, userId: 'user-1' })
    );
    expect(systemLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: SystemActions.EXPORT_PDF_PROCESSED, userId: 'user-1' })
    );
  });

  it('throws and logs failed action when use-case fails', async () => {
    const { startPdfWorker, workerInstances, execute, systemLog, loggerError } = loadPdfWorker();
    execute.mockResolvedValue(failureResult(new Error('pdf generation failed')));

    startPdfWorker();
    const worker = workerInstances[0];

    await expect(
      worker.processor({
        id: 'job-1',
        data: { exportId: 'export-1', snapshotId: 'snapshot-1', userId: 'user-1' },
      })
    ).rejects.toThrow('pdf generation failed');

    expect(systemLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: SystemActions.EXPORT_PDF_FAILED, userId: 'user-1' })
    );

    worker.handlers.failed({ id: 'job-2' }, new Error('worker failed'));
    expect(loggerError).toHaveBeenCalledWith('PDF worker failed', { error: expect.any(Error) });
    expect(systemLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: SystemActions.WORKER_PDF_FAILED, message: 'worker failed' })
    );
  });

  it('logs worker lifecycle events and handles system log write failures', async () => {
    const { startPdfWorker, workerInstances, execute, systemLog, loggerError } = loadPdfWorker();
    const logWriteError = new Error('system log unavailable');
    systemLog.mockRejectedValueOnce(logWriteError);
    execute.mockResolvedValue(successResult(undefined));

    startPdfWorker();
    const worker = workerInstances[0];

    await worker.processor({
      id: 'job-1',
      data: { exportId: 'export-1', snapshotId: 'snapshot-1', userId: 'user-1' },
    });
    worker.handlers.ready();
    worker.handlers.completed({ id: 'job-1', data: { exportId: 'export-1' } });

    expect(loggerError).toHaveBeenCalledWith('Failed to write system log', { error: logWriteError });
    expect(systemLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: SystemActions.WORKER_PDF_READY })
    );
    expect(systemLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: SystemActions.WORKER_PDF_COMPLETED,
        metadata: expect.objectContaining({ jobId: 'job-1', exportId: 'export-1' }),
      })
    );
  });

  it('uses default pdf failure message when result has no error and handles missing failed job metadata', async () => {
    const { startPdfWorker, workerInstances, execute, systemLog } = loadPdfWorker();
    execute.mockResolvedValue(failureResult(null));

    startPdfWorker();
    const worker = workerInstances[0];

    await expect(
      worker.processor({
        id: 'job-1',
        data: { exportId: 'export-1', snapshotId: 'snapshot-1', userId: 'user-1' },
      })
    ).rejects.toThrow('PDF generation failed');

    worker.handlers.failed(undefined, new Error('worker failure without job'));
    expect(systemLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: SystemActions.WORKER_PDF_FAILED,
        metadata: expect.objectContaining({ jobId: undefined }),
        message: 'worker failure without job',
      })
    );
  });
});
