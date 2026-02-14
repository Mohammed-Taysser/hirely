import { GetExportStatusUseCase } from '@dist/modules/resume/application/use-cases/get-export-status/get-export-status.use-case';
import {
  AppError,
  UnexpectedError,
} from '@dist/modules/shared/application/app-error';

class FakeAppError extends AppError {
  constructor(message: string) {
    super(message);
  }
}

describe('GetExportStatusUseCase', () => {
  it('returns export status from service', async () => {
    const exportService = {
      getExportStatus: jest.fn().mockResolvedValue({ status: 'READY', url: '/file.pdf' }),
      getExportStatusForResume: jest.fn(),
      generatePdfBuffer: jest.fn(),
      enforceExportLimit: jest.fn(),
      createExportRecord: jest.fn(),
      processPdfExport: jest.fn(),
    };

    const useCase = new GetExportStatusUseCase(exportService);
    const result = await useCase.execute({ userId: 'user-1', exportId: 'export-1' });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().status).toBe('READY');
  });

  it('returns app error from service', async () => {
    const exportService = {
      getExportStatus: jest.fn().mockRejectedValue(new FakeAppError('Not found')),
      getExportStatusForResume: jest.fn(),
      generatePdfBuffer: jest.fn(),
      enforceExportLimit: jest.fn(),
      createExportRecord: jest.fn(),
      processPdfExport: jest.fn(),
    };

    const useCase = new GetExportStatusUseCase(exportService);
    const result = await useCase.execute({ userId: 'user-1', exportId: 'missing' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(FakeAppError);
  });

  it('wraps unknown errors in unexpected error', async () => {
    const exportService = {
      getExportStatus: jest.fn().mockRejectedValue(new Error('boom')),
      getExportStatusForResume: jest.fn(),
      generatePdfBuffer: jest.fn(),
      enforceExportLimit: jest.fn(),
      createExportRecord: jest.fn(),
      processPdfExport: jest.fn(),
    };

    const useCase = new GetExportStatusUseCase(exportService);
    const result = await useCase.execute({ userId: 'user-1', exportId: 'export-1' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });
});
