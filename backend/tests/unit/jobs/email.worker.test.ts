import { failureResult, successResult } from '../../helpers/test-fixtures';

import { SystemActions } from '@dist/modules/system/application/system.actions';

type WorkerInstance = {
  queueName: string;
  processor: (job: { id: string; data: Record<string, unknown> }) => Promise<void>;
  options: unknown;
  handlers: Record<string, (...args: unknown[]) => unknown>;
  on: jest.Mock;
};

type LoadedEmailWorker = {
  startEmailWorker: () => WorkerInstance;
  workerInstances: WorkerInstance[];
  workerFactory: jest.Mock;
  execute: jest.Mock;
  systemLog: jest.Mock;
  loggerError: jest.Mock;
};

const loadEmailWorker = (): LoadedEmailWorker => {
  jest.resetModules();

  const workerInstances: WorkerInstance[] = [];
  const workerFactory = jest.fn().mockImplementation((queueName, processor, options) => {
    const handlers: Record<string, (...args: unknown[]) => unknown> = {};
    const worker = {
      queueName,
      processor,
      options,
      handlers,
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

  jest.doMock('bullmq', () => ({
    __esModule: true,
    Worker: workerFactory,
  }));
  jest.doMock('@dist/apps/worker-containers/email-worker.container', () => ({
    __esModule: true,
    sendExportEmailUseCase: {
      execute: (...args: unknown[]) => execute(...args),
    },
    systemLogService: {
      log: (...args: unknown[]) => systemLog(...args),
    },
  }));
  jest.doMock('@dist/apps/redis', () => ({
    __esModule: true,
    redisConnectionOptions: { host: 'localhost', port: 6379 },
  }));
  jest.doMock('@dist/shared/constants', () => ({
    __esModule: true,
    QUEUE_NAMES: { email: 'email-delivery' },
  }));
  jest.doMock('@dist/shared/logger', () => ({
    __esModule: true,
    logger: {
      error: (...args: unknown[]) => loggerError(...args),
    },
  }));

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { startEmailWorker } = require('@dist/jobs/workers/email.worker');

  return { startEmailWorker, workerInstances, workerFactory, execute, systemLog, loggerError };
};

describe('email.worker', () => {
  it('creates worker with expected queue and options', () => {
    const { startEmailWorker, workerFactory, workerInstances } = loadEmailWorker();

    startEmailWorker();

    expect(workerFactory).toHaveBeenCalledWith(
      'email-delivery',
      expect.any(Function),
      expect.objectContaining({
        connection: { host: 'localhost', port: 6379 },
      })
    );
    expect(workerInstances[0].on).toHaveBeenCalledWith('ready', expect.any(Function));
    expect(workerInstances[0].on).toHaveBeenCalledWith('completed', expect.any(Function));
    expect(workerInstances[0].on).toHaveBeenCalledWith('failed', expect.any(Function));
  });

  it('processes email job and logs processing + sent', async () => {
    const { startEmailWorker, workerInstances, execute, systemLog } = loadEmailWorker();
    execute.mockResolvedValue(successResult(undefined));
    startEmailWorker();

    await workerInstances[0].processor({
      id: 'job-1',
      data: {
        exportId: 'export-1',
        userId: 'user-1',
        to: 'person@example.com',
        reason: 'free-tier-export',
      },
    });

    expect(execute).toHaveBeenCalledWith({
      exportId: 'export-1',
      userId: 'user-1',
      to: 'person@example.com',
      reason: 'free-tier-export',
      recipient: undefined,
    });
    expect(systemLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: SystemActions.EXPORT_EMAIL_PROCESSING, userId: 'user-1' })
    );
    expect(systemLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: SystemActions.EXPORT_EMAIL_SENT, userId: 'user-1' })
    );
  });

  it('throws and logs failed action when send-export-email fails', async () => {
    const { startEmailWorker, workerInstances, execute, systemLog } = loadEmailWorker();
    execute.mockResolvedValue(failureResult(new Error('email failed')));
    startEmailWorker();

    await expect(
      workerInstances[0].processor({
        id: 'job-1',
        data: {
          exportId: 'export-1',
          userId: 'user-1',
          to: 'person@example.com',
          reason: 'bulk-apply',
        },
      })
    ).rejects.toThrow('email failed');

    expect(systemLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: SystemActions.EXPORT_EMAIL_FAILED, userId: 'user-1' })
    );
    workerInstances[0].handlers.failed({ id: 'job-2' }, new Error('worker failed'));
    expect(systemLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: SystemActions.WORKER_EMAIL_FAILED, message: 'worker failed' })
    );
  });

  it('logs lifecycle actions and catches system log write errors', async () => {
    const { startEmailWorker, workerInstances, execute, systemLog, loggerError } = loadEmailWorker();
    const logWriteError = new Error('system log unavailable');
    systemLog.mockRejectedValueOnce(logWriteError);
    execute.mockResolvedValue(successResult(undefined));

    startEmailWorker();
    const worker = workerInstances[0];

    await worker.processor({
      id: 'job-1',
      data: {
        exportId: 'export-1',
        userId: 'user-1',
        to: 'person@example.com',
        reason: 'free-tier-export',
      },
    });
    worker.handlers.ready();
    worker.handlers.completed({ id: 'job-1', data: { exportId: 'export-1' } });

    expect(loggerError).toHaveBeenCalledWith('Failed to write system log', { error: logWriteError });
    expect(systemLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: SystemActions.WORKER_EMAIL_READY })
    );
    expect(systemLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: SystemActions.WORKER_EMAIL_COMPLETED,
        metadata: { jobId: 'job-1', exportId: 'export-1' },
      })
    );
  });

  it('uses default email failure message when result has no error and handles failed event without job', async () => {
    const { startEmailWorker, workerInstances, execute, systemLog } = loadEmailWorker();
    execute.mockResolvedValue(failureResult(null));

    startEmailWorker();
    const worker = workerInstances[0];

    await expect(
      worker.processor({
        id: 'job-1',
        data: {
          exportId: 'export-1',
          userId: 'user-1',
          to: 'person@example.com',
          reason: 'free-tier-export',
        },
      })
    ).rejects.toThrow('Email job failed');

    worker.handlers.failed(undefined, new Error('worker failed without job'));
    expect(systemLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: SystemActions.WORKER_EMAIL_FAILED,
        metadata: { jobId: undefined },
        message: 'worker failed without job',
      })
    );
  });
});
