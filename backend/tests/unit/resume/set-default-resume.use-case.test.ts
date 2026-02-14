import { SetDefaultResumeUseCase } from '@dist/modules/resume/application/use-cases/set-default-resume/set-default-resume.use-case';
import {
  NotFoundError,
  UnexpectedError,
} from '@dist/modules/shared/application/app-error';

const buildDependencies = () => {
  const resumeDefaultRepository = {
    setDefaultResume: jest.fn(async (): Promise<void> => undefined),
    findOldestResumeIdByUserId: jest.fn(async (): Promise<string | null> => null),
  };

  const currentResume = {
    id: 'resume-1',
    userId: 'user-1',
    name: 'Resume 1',
    isDefault: false,
    data: {
      meta: { title: 'Resume', language: 'en' },
      sections: {
        summary: { type: 'summary', content: { text: 'About me' } },
      },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const resumeQueryRepository = {
    findById: jest.fn().mockResolvedValue(currentResume),
    findByIdForExport: jest.fn(async (): Promise<null> => null),
    getPaginatedResumes: jest.fn(async (): Promise<[never[], number]> => [[], 0]),
    getBasicResumes: jest.fn(async (): Promise<never[]> => []),
    getPaginatedSnapshots: jest.fn(async (): Promise<[never[], number]> => [[], 0]),
  };

  const systemLogService = { log: jest.fn(async (): Promise<void> => undefined) };
  const auditLogService = { log: jest.fn(async (): Promise<void> => undefined) };

  const useCase = new SetDefaultResumeUseCase(
    resumeDefaultRepository,
    resumeQueryRepository,
    systemLogService,
    auditLogService
  );

  return {
    useCase,
    resumeDefaultRepository,
    resumeQueryRepository,
    systemLogService,
    auditLogService,
    currentResume,
  };
};

describe('SetDefaultResumeUseCase', () => {
  it('returns not found when resume does not exist', async () => {
    const deps = buildDependencies();
    deps.resumeQueryRepository.findById.mockResolvedValueOnce(null);

    const result = await deps.useCase.execute({ resumeId: 'missing', userId: 'user-1' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
    expect(deps.resumeDefaultRepository.setDefaultResume).not.toHaveBeenCalled();
  });

  it('sets default resume when current resume is not default', async () => {
    const deps = buildDependencies();
    deps.resumeQueryRepository.findById
      .mockResolvedValueOnce(deps.currentResume)
      .mockResolvedValueOnce({ ...deps.currentResume, isDefault: true });

    const result = await deps.useCase.execute({ resumeId: 'resume-1', userId: 'user-1' });

    expect(result.isSuccess).toBe(true);
    expect(deps.resumeDefaultRepository.setDefaultResume).toHaveBeenCalledWith('user-1', 'resume-1');
    expect(deps.systemLogService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'info',
      })
    );
    expect(deps.auditLogService.log).toHaveBeenCalledTimes(1);
  });

  it('does not set default again when resume is already default', async () => {
    const deps = buildDependencies();
    deps.resumeQueryRepository.findById.mockResolvedValue({ ...deps.currentResume, isDefault: true });

    const result = await deps.useCase.execute({ resumeId: 'resume-1', userId: 'user-1' });

    expect(result.isSuccess).toBe(true);
    expect(deps.resumeDefaultRepository.setDefaultResume).not.toHaveBeenCalled();
  });

  it('returns not found when updated resume cannot be loaded', async () => {
    const deps = buildDependencies();
    deps.resumeQueryRepository.findById.mockResolvedValueOnce(deps.currentResume).mockResolvedValueOnce(null);

    const result = await deps.useCase.execute({ resumeId: 'resume-1', userId: 'user-1' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
  });

  it('returns unexpected error when repository throws', async () => {
    const deps = buildDependencies();
    deps.resumeDefaultRepository.setDefaultResume.mockRejectedValue(new Error('db down'));

    const result = await deps.useCase.execute({ resumeId: 'resume-1', userId: 'user-1' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
    expect(deps.systemLogService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'error',
      })
    );
  });
});
