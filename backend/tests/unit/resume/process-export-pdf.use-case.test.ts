import { ProcessExportPdfUseCase } from '@dist/modules/resume/application/use-cases/process-export-pdf/process-export-pdf.use-case';
import {
  AppError,
  UnexpectedError,
} from '@dist/modules/shared/application/app-error';

class FakeAppError extends AppError {
  constructor(message: string) {
    super(message);
  }
}

describe('ProcessExportPdfUseCase', () => {
  const request = {
    exportId: 'export-1',
    snapshotId: 'snapshot-1',
    userId: 'user-1',
  };

  it('processes export and logs success audit', async () => {
    const exportService = {
      processPdfExport: jest.fn().mockResolvedValue(undefined),
      generatePdfBuffer: jest.fn(),
      getExportStatus: jest.fn(),
      getExportStatusForResume: jest.fn(),
      enforceExportLimit: jest.fn(),
      createExportRecord: jest.fn(),
      markReady: jest.fn(),
      markFailed: jest.fn(),
      generateAndStoreExport: jest.fn(),
    };
    const auditLogService = { log: jest.fn() };

    const useCase = new ProcessExportPdfUseCase(exportService, auditLogService);
    const result = await useCase.execute(request);

    expect(result.isSuccess).toBe(true);
    expect(exportService.processPdfExport).toHaveBeenCalledWith(request);
    expect(auditLogService.log).toHaveBeenCalled();
  });

  it('returns app error and logs failure audit', async () => {
    const exportService = {
      processPdfExport: jest.fn().mockRejectedValue(new FakeAppError('Not found')),
      generatePdfBuffer: jest.fn(),
      getExportStatus: jest.fn(),
      getExportStatusForResume: jest.fn(),
      enforceExportLimit: jest.fn(),
      createExportRecord: jest.fn(),
      markReady: jest.fn(),
      markFailed: jest.fn(),
      generateAndStoreExport: jest.fn(),
    };
    const auditLogService = { log: jest.fn() };

    const useCase = new ProcessExportPdfUseCase(exportService, auditLogService);
    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(FakeAppError);
    expect(auditLogService.log).toHaveBeenCalledTimes(1);
  });

  it('wraps unknown error as unexpected', async () => {
    const exportService = {
      processPdfExport: jest.fn().mockRejectedValue(new Error('boom')),
      generatePdfBuffer: jest.fn(),
      getExportStatus: jest.fn(),
      getExportStatusForResume: jest.fn(),
      enforceExportLimit: jest.fn(),
      createExportRecord: jest.fn(),
      markReady: jest.fn(),
      markFailed: jest.fn(),
      generateAndStoreExport: jest.fn(),
    };
    const auditLogService = { log: jest.fn() };

    const useCase = new ProcessExportPdfUseCase(exportService, auditLogService);
    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });
});
