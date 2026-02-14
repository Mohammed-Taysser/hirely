import { EvaluateExportFailureAlertsUseCase } from '@dist/modules/system/application/use-cases/evaluate-export-failure-alerts/evaluate-export-failure-alerts.use-case';
import { SystemActions } from '@dist/modules/system/application/system.actions';
import { UnexpectedError } from '@dist/modules/shared/application/app-error';

describe('EvaluateExportFailureAlertsUseCase', () => {
  const buildDependencies = () => {
    const systemLogQueryRepository = {
      getActionCounts: jest.fn().mockResolvedValue({
        [SystemActions.EXPORT_PDF_PROCESSED]: 30,
        [SystemActions.EXPORT_PDF_FAILED]: 10,
        [SystemActions.EXPORT_EMAIL_SENT]: 10,
        [SystemActions.EXPORT_EMAIL_FAILED]: 2,
      }),
      getActionCountsByReason: jest.fn(),
      countByUserAndActionInRange: jest.fn(),
      hasActionSince: jest.fn().mockResolvedValue(false),
      findFailedExportEmailJobs: jest.fn(),
      findFailedExportEmailJobById: jest.fn(),
    };

    const systemLogService = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    const config = {
      EXPORT_ALERT_WINDOW_MINUTES: 60,
      EXPORT_ALERT_MIN_EVENTS: 20,
      EXPORT_ALERT_FAILURE_RATIO: 0.25,
      EXPORT_ALERT_COOLDOWN_SECONDS: 900,
    };

    const useCase = new EvaluateExportFailureAlertsUseCase(
      systemLogQueryRepository,
      systemLogService,
      config as never
    );

    return {
      useCase,
      systemLogQueryRepository,
      systemLogService,
    };
  };

  it('triggers alert for channels exceeding threshold', async () => {
    const deps = buildDependencies();

    const result = await deps.useCase.execute({ now: new Date('2026-02-14T12:00:00.000Z') });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().pdf).toEqual(
      expect.objectContaining({
        total: 40,
        failed: 10,
        thresholdExceeded: true,
        triggered: true,
        suppressedByCooldown: false,
      })
    );
    expect(result.getValue().email).toEqual(
      expect.objectContaining({
        total: 12,
        failed: 2,
        thresholdExceeded: false,
        triggered: false,
      })
    );
    expect(deps.systemLogService.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: SystemActions.EXPORT_PDF_FAILURE_ALERT_TRIGGERED })
    );
  });

  it('suppresses alert during cooldown period', async () => {
    const deps = buildDependencies();
    deps.systemLogQueryRepository.hasActionSince.mockResolvedValue(true);

    const result = await deps.useCase.execute({});

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().pdf).toEqual(
      expect.objectContaining({
        thresholdExceeded: true,
        triggered: false,
        suppressedByCooldown: true,
      })
    );
    expect(deps.systemLogService.log).not.toHaveBeenCalled();
  });

  it('returns unexpected error when query fails', async () => {
    const deps = buildDependencies();
    deps.systemLogQueryRepository.getActionCounts.mockRejectedValue(new Error('db down'));

    const result = await deps.useCase.execute({});

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });
});
