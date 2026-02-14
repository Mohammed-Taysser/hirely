import { GetResumesListUseCase } from '@dist/modules/resume/application/use-cases/get-resumes-list/get-resumes-list.use-case';
import { UnexpectedError } from '@dist/modules/shared/application/app-error';

describe('GetResumesListUseCase', () => {
  it('returns basic resumes list', async () => {
    const resumeQueryRepository = {
      getBasicResumes: jest.fn().mockResolvedValue([{ id: 'resume-1' }]),
      findById: jest.fn(),
      findByIdForExport: jest.fn(),
      getPaginatedResumes: jest.fn(),
      getPaginatedSnapshots: jest.fn(),
    };

    const useCase = new GetResumesListUseCase(resumeQueryRepository);
    const result = await useCase.execute({ filters: {} });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toHaveLength(1);
  });

  it('returns unexpected error when repository throws', async () => {
    const resumeQueryRepository = {
      getBasicResumes: jest.fn().mockRejectedValue(new Error('db failed')),
      findById: jest.fn(),
      findByIdForExport: jest.fn(),
      getPaginatedResumes: jest.fn(),
      getPaginatedSnapshots: jest.fn(),
    };

    const useCase = new GetResumesListUseCase(resumeQueryRepository);
    const result = await useCase.execute({ filters: {} });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });
});
