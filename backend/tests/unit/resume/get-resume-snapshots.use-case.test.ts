import { GetResumeSnapshotsUseCase } from '@dist/modules/resume/application/use-cases/get-resume-snapshots/get-resume-snapshots.use-case';
import { UnexpectedError } from '@dist/modules/shared/application/app-error';

describe('GetResumeSnapshotsUseCase', () => {
  it('returns paginated snapshots', async () => {
    const resumeQueryRepository = {
      getPaginatedSnapshots: jest.fn().mockResolvedValue([[{ id: 'snapshot-1' }], 1]),
      findById: jest.fn(),
      findByIdForExport: jest.fn(),
      getPaginatedResumes: jest.fn(),
      getBasicResumes: jest.fn(),
    };

    const useCase = new GetResumeSnapshotsUseCase(resumeQueryRepository);
    const result = await useCase.execute({ page: 1, limit: 10, filters: {} });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().total).toBe(1);
  });

  it('returns unexpected error when repository fails', async () => {
    const resumeQueryRepository = {
      getPaginatedSnapshots: jest.fn().mockRejectedValue(new Error('db failed')),
      findById: jest.fn(),
      findByIdForExport: jest.fn(),
      getPaginatedResumes: jest.fn(),
      getBasicResumes: jest.fn(),
    };

    const useCase = new GetResumeSnapshotsUseCase(resumeQueryRepository);
    const result = await useCase.execute({ page: 1, limit: 10, filters: {} });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });
});
