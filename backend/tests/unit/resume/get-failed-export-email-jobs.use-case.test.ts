import { GetFailedExportEmailJobsUseCase } from '@dist/modules/resume/application/use-cases/get-failed-export-email-jobs/get-failed-export-email-jobs.use-case';
import { UnexpectedError } from '@dist/modules/shared/application/app-error';

describe('GetFailedExportEmailJobsUseCase', () => {
  it('returns failed export email jobs', async () => {
    const repository = {
      findFailedExportEmailJobs: jest.fn().mockResolvedValue({ jobs: [{ id: 'log-1' }], total: 1 }),
    };

    const useCase = new GetFailedExportEmailJobsUseCase(repository as never);
    const result = await useCase.execute({ userId: 'user-1', page: 1, limit: 10 });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual({ jobs: [{ id: 'log-1' }], total: 1 });
  });

  it('returns unexpected error when repository fails', async () => {
    const repository = {
      findFailedExportEmailJobs: jest.fn().mockRejectedValue(new Error('db failed')),
    };

    const useCase = new GetFailedExportEmailJobsUseCase(repository as never);
    const result = await useCase.execute({ userId: 'user-1', page: 1, limit: 10 });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });
});
