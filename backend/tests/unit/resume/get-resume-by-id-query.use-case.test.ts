import { GetResumeByIdQueryUseCase } from '@dist/modules/resume/application/use-cases/get-resume-by-id-query/get-resume-by-id-query.use-case';
import {
  NotFoundError,
  UnexpectedError,
} from '@dist/modules/shared/application/app-error';

describe('GetResumeByIdQueryUseCase', () => {
  it('returns resume for owner', async () => {
    const resumeQueryRepository = {
      findById: jest.fn().mockResolvedValue({ id: 'resume-1', userId: 'user-1' }),
      findByIdForExport: jest.fn(),
      getPaginatedResumes: jest.fn(),
      getBasicResumes: jest.fn(),
      getPaginatedSnapshots: jest.fn(),
    };

    const useCase = new GetResumeByIdQueryUseCase(resumeQueryRepository);
    const result = await useCase.execute({ resumeId: 'resume-1', userId: 'user-1' });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().id).toBe('resume-1');
  });

  it('returns not found for missing resume', async () => {
    const resumeQueryRepository = {
      findById: jest.fn().mockResolvedValue(null),
      findByIdForExport: jest.fn(),
      getPaginatedResumes: jest.fn(),
      getBasicResumes: jest.fn(),
      getPaginatedSnapshots: jest.fn(),
    };

    const useCase = new GetResumeByIdQueryUseCase(resumeQueryRepository);
    const result = await useCase.execute({ resumeId: 'missing', userId: 'user-1' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
  });

  it('returns unexpected error on repository exception', async () => {
    const resumeQueryRepository = {
      findById: jest.fn().mockRejectedValue(new Error('db failed')),
      findByIdForExport: jest.fn(),
      getPaginatedResumes: jest.fn(),
      getBasicResumes: jest.fn(),
      getPaginatedSnapshots: jest.fn(),
    };

    const useCase = new GetResumeByIdQueryUseCase(resumeQueryRepository);
    const result = await useCase.execute({ resumeId: 'resume-1', userId: 'user-1' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });

  it('wraps non-error repository failure as unexpected error', async () => {
    const resumeQueryRepository = {
      findById: jest.fn().mockRejectedValue('db failed'),
      findByIdForExport: jest.fn(),
      getPaginatedResumes: jest.fn(),
      getBasicResumes: jest.fn(),
      getPaginatedSnapshots: jest.fn(),
    };

    const useCase = new GetResumeByIdQueryUseCase(resumeQueryRepository);
    const result = await useCase.execute({ resumeId: 'resume-1', userId: 'user-1' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });
});
