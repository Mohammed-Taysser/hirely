import { failureResult, successResult } from '../../helpers/test-fixtures';

import { AuditActions } from '@dist/modules/audit/application/audit.actions';
import { SystemActions } from '@dist/modules/system/application/system.actions';

type WorkerInstance = {
  processor: () => Promise<void>;
  handlers: Record<string, (...args: unknown[]) => unknown>;
  on: jest.Mock;
};

type LoadedPlanWorker = {
  startPlanWorker: () => unknown;
  workerInstances: WorkerInstance[];
  workerFactory: jest.Mock;
  queueAdd: jest.Mock;
  applyExecute: jest.Mock;
  systemLog: jest.Mock;
  auditLog: jest.Mock;
  loggerError: jest.Mock;
};

const flushPromises = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

const loadPlanWorker = async (): Promise<LoadedPlanWorker> => {
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
  const applyExecute = jest.fn();
  const systemLog = jest.fn().mockResolvedValue(undefined);
  const auditLog = jest.fn().mockResolvedValue(undefined);
  const loggerError = jest.fn();

  jest.doMock('bullmq', () => ({
    __esModule: true,
    Worker: workerFactory,
  }));
  jest.doMock('@dist/apps/config', () => ({
    __esModule: true,
    default: {
      PLAN_CHANGE_INTERVAL_SECONDS: 300,
    },
  }));
  jest.doMock('@dist/apps/constant', () => ({
    __esModule: true,
    QUEUE_NAMES: { planChanges: 'plan-changes' },
  }));
  jest.doMock('@dist/apps/redis', () => ({
    __esModule: true,
    redisConnectionOptions: { host: 'localhost', port: 6379 },
  }));
  jest.doMock('@dist/apps/worker-containers/plan-worker.container', () => ({
    __esModule: true,
    applyScheduledPlanChangesUseCase: {
      execute: (...args: unknown[]) => applyExecute(...args),
    },
    systemLogService: {
      log: (...args: unknown[]) => systemLog(...args),
    },
    auditLogService: {
      log: (...args: unknown[]) => auditLog(...args),
    },
  }));
  jest.doMock('@dist/jobs/queues/plan.queue', () => ({
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

  const { startPlanWorker } = await import('@dist/jobs/workers/plan.worker');

  return {
    startPlanWorker,
    workerInstances,
    workerFactory,
    queueAdd,
    applyExecute,
    systemLog,
    auditLog,
    loggerError,
  };
};

describe('plan.worker', () => {
  it('schedules repeatable job on startup and logs success', async () => {
    const { startPlanWorker, queueAdd, systemLog, workerFactory } = await loadPlanWorker();

    startPlanWorker();
    await flushPromises();

    expect(queueAdd).toHaveBeenCalledWith(
      'apply-scheduled-plan-changes',
      {},
      expect.objectContaining({
        repeat: { every: 300000 },
        removeOnComplete: true,
        removeOnFail: 10,
      })
    );
    expect(systemLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: SystemActions.PLAN_WORKER_SCHEDULED,
        metadata: { intervalSeconds: 300 },
      })
    );
    expect(workerFactory).toHaveBeenCalledWith(
      'plan-changes',
      expect.any(Function),
      expect.objectContaining({ connection: { host: 'localhost', port: 6379 } })
    );
  });

  it('applies scheduled changes and writes system + audit logs', async () => {
    const { startPlanWorker, workerInstances, applyExecute, systemLog, auditLog } =
      await loadPlanWorker();
    applyExecute.mockResolvedValue(
      successResult([
        { userId: 'user-1', planId: 'plan-pro' },
        { userId: 'user-2', planId: 'plan-free' },
      ])
    );

    startPlanWorker();
    await workerInstances[0].processor();

    expect(applyExecute).toHaveBeenCalledWith({ now: expect.any(Date) });
    expect(systemLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: SystemActions.PLAN_WORKER_RUN_STARTED })
    );
    expect(systemLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: SystemActions.PLAN_WORKER_RUN_COMPLETED,
        metadata: { updated: 2 },
      })
    );
    expect(systemLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: SystemActions.USER_PLAN_APPLIED, userId: 'user-1' })
    );
    expect(auditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditActions.USER_PLAN_APPLIED,
        actorUserId: 'user-1',
        entityType: 'user',
        entityId: 'user-1',
      })
    );
  });

  it('logs schedule failure and propagates processing failures', async () => {
    const { startPlanWorker, workerInstances, queueAdd, applyExecute, systemLog } =
      await loadPlanWorker();
    queueAdd.mockRejectedValue(new Error('schedule failed'));
    applyExecute.mockResolvedValue(failureResult(new Error('apply failed')));

    startPlanWorker();
    await flushPromises();

    expect(systemLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: SystemActions.PLAN_WORKER_SCHEDULE_FAILED,
        message: 'schedule failed',
      })
    );

    await expect(workerInstances[0].processor()).rejects.toThrow('apply failed');
    workerInstances[0].handlers.failed({ id: 'job-1' }, new Error('run failed'));

    expect(systemLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: SystemActions.PLAN_WORKER_RUN_FAILED,
        message: 'run failed',
      })
    );
  });

  it('handles lifecycle + audit/system log write failures without crashing', async () => {
    const { startPlanWorker, workerInstances, applyExecute, systemLog, auditLog, loggerError } =
      await loadPlanWorker();
    const systemLogWriteError = new Error('system log unavailable');
    const auditLogWriteError = new Error('audit log unavailable');
    systemLog.mockRejectedValueOnce(systemLogWriteError);
    auditLog.mockRejectedValueOnce(auditLogWriteError);
    applyExecute.mockResolvedValue(successResult([{ userId: 'user-1', planId: 'plan-pro' }]));

    startPlanWorker();
    const worker = workerInstances[0];
    worker.handlers.ready();
    await worker.processor();

    expect(loggerError).toHaveBeenCalledWith('Failed to write system log', {
      error: systemLogWriteError,
    });
    expect(loggerError).toHaveBeenCalledWith('Failed to write audit log', {
      error: auditLogWriteError,
    });
    expect(systemLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: SystemActions.PLAN_WORKER_READY })
    );
  });

  it('logs unknown schedule errors and handles worker failed event without job id', async () => {
    const { startPlanWorker, queueAdd, workerInstances, systemLog } = await loadPlanWorker();
    queueAdd.mockRejectedValue('non-error');

    startPlanWorker();
    await flushPromises();

    expect(systemLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: SystemActions.PLAN_WORKER_SCHEDULE_FAILED,
        message: 'Unknown error',
      })
    );

    workerInstances[0].handlers.failed(undefined, new Error('worker failed without job'));
    expect(systemLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: SystemActions.PLAN_WORKER_RUN_FAILED,
        metadata: { jobId: undefined },
        message: 'worker failed without job',
      })
    );
  });

  it('completes run with zero updates when no scheduled plan changes are pending', async () => {
    const { startPlanWorker, workerInstances, applyExecute, systemLog, auditLog } =
      await loadPlanWorker();
    applyExecute.mockResolvedValue(successResult([]));

    startPlanWorker();
    await workerInstances[0].processor();

    expect(systemLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: SystemActions.PLAN_WORKER_RUN_COMPLETED,
        metadata: { updated: 0 },
      })
    );
    expect(auditLog).not.toHaveBeenCalled();
  });
});
