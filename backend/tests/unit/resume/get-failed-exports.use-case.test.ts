import { GetFailedExportsUseCase } from '@dist/modules/resume/application/use-cases/get-failed-exports/get-failed-exports.use-case';
import { UnexpectedError } from '@dist/modules/shared/application/app-error';

describe('GetFailedExportsUseCase', () => {
  it('returns failed exports', async () => {
    const repository = {
      getFailedExportsByUser: jest.fn().mockResolvedValue([[{ id: 'export-1' }], 1]),
    };

    const useCase = new GetFailedExportsUseCase(repository as never);
    const result = await useCase.execute({ userId: 'user-1', page: 1, limit: 10 });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual({ exports: [{ id: 'export-1' }], total: 1 });
  });

  it('returns unexpected error when repository fails', async () => {
    const repository = {
      getFailedExportsByUser: jest.fn().mockRejectedValue(new Error('db failed')),
    };

    const useCase = new GetFailedExportsUseCase(repository as never);
    const result = await useCase.execute({ userId: 'user-1', page: 1, limit: 10 });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });
});
