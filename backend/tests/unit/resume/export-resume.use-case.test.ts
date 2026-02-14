import { ExportResumeUseCase } from '@dist/modules/resume/application/use-cases/export-resume/export-resume.use-case';
import {
  AppError,
  UnexpectedError,
} from '@dist/modules/shared/application/app-error';

class FakeAppError extends AppError {
  constructor(message: string) {
    super(message);
  }
}

describe('ExportResumeUseCase', () => {
  it('returns pdf export result on success', async () => {
    const exportService = {
      generatePdfBuffer: jest.fn().mockResolvedValue({
        buffer: Buffer.from('pdf'),
        filename: 'resume.pdf',
        mimeType: 'application/pdf',
      }),
      getExportStatus: jest.fn(),
      getExportStatusForResume: jest.fn(),
      enforceExportLimit: jest.fn(),
      createExportRecord: jest.fn(),
      processPdfExport: jest.fn(),
      markReady: jest.fn(),
      markFailed: jest.fn(),
      generateAndStoreExport: jest.fn(),
    };
    const auditLogService = { log: jest.fn() };

    const useCase = new ExportResumeUseCase(exportService, auditLogService);
    const result = await useCase.execute({ userId: 'user-1', resumeId: 'resume-1' });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().filename).toBe('resume.pdf');
    expect(auditLogService.log).toHaveBeenCalled();
  });

  it('returns app error directly', async () => {
    const exportService = {
      generatePdfBuffer: jest.fn().mockRejectedValue(new FakeAppError('Forbidden')),
      getExportStatus: jest.fn(),
      getExportStatusForResume: jest.fn(),
      enforceExportLimit: jest.fn(),
      createExportRecord: jest.fn(),
      processPdfExport: jest.fn(),
      markReady: jest.fn(),
      markFailed: jest.fn(),
      generateAndStoreExport: jest.fn(),
    };
    const auditLogService = { log: jest.fn() };

    const useCase = new ExportResumeUseCase(exportService, auditLogService);
    const result = await useCase.execute({ userId: 'user-1', resumeId: 'resume-1' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(FakeAppError);
  });

  it('wraps unknown error as unexpected', async () => {
    const exportService = {
      generatePdfBuffer: jest.fn().mockRejectedValue(new Error('boom')),
      getExportStatus: jest.fn(),
      getExportStatusForResume: jest.fn(),
      enforceExportLimit: jest.fn(),
      createExportRecord: jest.fn(),
      processPdfExport: jest.fn(),
      markReady: jest.fn(),
      markFailed: jest.fn(),
      generateAndStoreExport: jest.fn(),
    };
    const auditLogService = { log: jest.fn() };

    const useCase = new ExportResumeUseCase(exportService, auditLogService);
    const result = await useCase.execute({ userId: 'user-1', resumeId: 'resume-1' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });
});
