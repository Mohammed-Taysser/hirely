import { GetResumeExportsUseCase } from '@dist/modules/resume/application/use-cases/get-resume-exports/get-resume-exports.use-case';
import { UnexpectedError } from '@dist/modules/shared/application/app-error';

describe('GetResumeExportsUseCase', () => {
  it('returns paginated exports', async () => {
    const resumeExportQueryRepository = {
      getPaginatedExports: jest.fn().mockResolvedValue([[{ id: 'export-1' }], 1]),
      findById: jest.fn(),
      getLatestForResume: jest.fn(),
    };

    const useCase = new GetResumeExportsUseCase(resumeExportQueryRepository);
    const result = await useCase.execute({ page: 1, limit: 10, filters: {} });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().total).toBe(1);
    expect(result.getValue().exports).toHaveLength(1);
  });

  it('returns unexpected error on failure', async () => {
    const resumeExportQueryRepository = {
      getPaginatedExports: jest.fn().mockRejectedValue(new Error('db failed')),
      findById: jest.fn(),
      getLatestForResume: jest.fn(),
    };

    const useCase = new GetResumeExportsUseCase(resumeExportQueryRepository);
    const result = await useCase.execute({ page: 1, limit: 10, filters: {} });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });

  it('wraps non-error failures as unexpected errors', async () => {
    const resumeExportQueryRepository = {
      getPaginatedExports: jest.fn().mockRejectedValue('db failed'),
      findById: jest.fn(),
      getLatestForResume: jest.fn(),
    };

    const useCase = new GetResumeExportsUseCase(resumeExportQueryRepository);
    const result = await useCase.execute({ page: 2, limit: 5, filters: { status: 'READY' } });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });
});
