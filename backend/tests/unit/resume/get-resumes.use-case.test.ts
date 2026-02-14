import { GetResumesUseCase } from '@dist/modules/resume/application/use-cases/get-resumes/get-resumes.use-case';
import { UnexpectedError } from '@dist/modules/shared/application/app-error';

describe('GetResumesUseCase', () => {
  it('returns paginated resumes', async () => {
    const resumeQueryRepository = {
      getPaginatedResumes: jest.fn().mockResolvedValue([[{ id: 'resume-1' }], 1]),
      findById: jest.fn(),
      findByIdForExport: jest.fn(),
      getBasicResumes: jest.fn(),
      getPaginatedSnapshots: jest.fn(),
    };

    const useCase = new GetResumesUseCase(resumeQueryRepository);
    const result = await useCase.execute({ page: 1, limit: 10, filters: {} });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().total).toBe(1);
  });

  it('returns unexpected error when repository throws', async () => {
    const resumeQueryRepository = {
      getPaginatedResumes: jest.fn().mockRejectedValue(new Error('db failed')),
      findById: jest.fn(),
      findByIdForExport: jest.fn(),
      getBasicResumes: jest.fn(),
      getPaginatedSnapshots: jest.fn(),
    };

    const useCase = new GetResumesUseCase(resumeQueryRepository);
    const result = await useCase.execute({ page: 1, limit: 10, filters: {} });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });
});
