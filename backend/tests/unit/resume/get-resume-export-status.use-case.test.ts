import { GetResumeExportStatusUseCase } from '@dist/modules/resume/application/use-cases/get-resume-export-status/get-resume-export-status.use-case';
import {
  AppError,
  UnexpectedError,
} from '@dist/modules/shared/application/app-error';

class FakeAppError extends AppError {
  constructor(message: string) {
    super(message);
  }
}

describe('GetResumeExportStatusUseCase', () => {
  it('returns status for resume export', async () => {
    const exportService = {
      getExportStatusForResume: jest.fn().mockResolvedValue({ status: 'PROCESSING' }),
      getExportStatus: jest.fn(),
      generatePdfBuffer: jest.fn(),
      enforceExportLimit: jest.fn(),
      createExportRecord: jest.fn(),
      processPdfExport: jest.fn(),
    };

    const useCase = new GetResumeExportStatusUseCase(exportService);
    const result = await useCase.execute({
      userId: 'user-1',
      resumeId: 'resume-1',
      exportId: 'export-1',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().status).toBe('PROCESSING');
  });

  it('returns app error without wrapping', async () => {
    const exportService = {
      getExportStatusForResume: jest.fn().mockRejectedValue(new FakeAppError('Not found')),
      getExportStatus: jest.fn(),
      generatePdfBuffer: jest.fn(),
      enforceExportLimit: jest.fn(),
      createExportRecord: jest.fn(),
      processPdfExport: jest.fn(),
    };

    const useCase = new GetResumeExportStatusUseCase(exportService);
    const result = await useCase.execute({
      userId: 'user-1',
      resumeId: 'resume-1',
      exportId: 'export-1',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(FakeAppError);
  });

  it('returns unexpected error for unknown exceptions', async () => {
    const exportService = {
      getExportStatusForResume: jest.fn().mockRejectedValue(new Error('boom')),
      getExportStatus: jest.fn(),
      generatePdfBuffer: jest.fn(),
      enforceExportLimit: jest.fn(),
      createExportRecord: jest.fn(),
      processPdfExport: jest.fn(),
    };

    const useCase = new GetResumeExportStatusUseCase(exportService);
    const result = await useCase.execute({
      userId: 'user-1',
      resumeId: 'resume-1',
      exportId: 'export-1',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });
});
