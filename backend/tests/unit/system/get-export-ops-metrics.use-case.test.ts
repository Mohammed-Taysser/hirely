import { GetExportOpsMetricsUseCase } from '@dist/modules/system/application/use-cases/get-export-ops-metrics/get-export-ops-metrics.use-case';
import { UnexpectedError } from '@dist/modules/shared/application/app-error';
import { SystemActions } from '@dist/modules/system/application/system.actions';

describe('GetExportOpsMetricsUseCase', () => {
  it('returns counters mapped from system actions', async () => {
    const repository = {
      getActionCounts: jest.fn().mockResolvedValue({
        [SystemActions.EXPORT_PDF_PROCESSED]: 12,
        [SystemActions.EXPORT_PDF_FAILED]: 2,
        [SystemActions.EXPORT_EMAIL_SENT]: 9,
        [SystemActions.EXPORT_EMAIL_FAILED]: 3,
        [SystemActions.EXPORT_CLEANUP_RUN_COMPLETED]: 4,
        [SystemActions.EXPORT_CLEANUP_RUN_FAILED]: 1,
      }),
    };

    const useCase = new GetExportOpsMetricsUseCase(repository as never);
    const result = await useCase.execute({ hours: 24 });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual(
      expect.objectContaining({
        timeframeHours: 24,
        counters: {
          pdfProcessed: 12,
          pdfFailed: 2,
          emailSent: 9,
          emailFailed: 3,
          cleanupCompleted: 4,
          cleanupFailed: 1,
        },
      })
    );
  });

  it('returns unexpected error when repository fails', async () => {
    const repository = {
      getActionCounts: jest.fn().mockRejectedValue(new Error('db failed')),
    };

    const useCase = new GetExportOpsMetricsUseCase(repository as never);
    const result = await useCase.execute({ hours: 24 });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });
});
