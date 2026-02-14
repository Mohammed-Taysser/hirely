import { DeleteResumeUseCase } from '@dist/modules/resume/application/use-cases/delete-resume/delete-resume.use-case';
import {
  NotFoundError,
  UnexpectedError,
} from '@dist/modules/shared/application/app-error';

describe('DeleteResumeUseCase', () => {
  it('returns not found when resume does not exist', async () => {
    const resumeRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
      countByUserId: jest.fn(),
    };
    const resumeDefaultRepository = {
      setDefaultResume: jest.fn(),
      findOldestResumeIdByUserId: jest.fn(),
    };
    const resumeQueryRepository = {
      findById: jest.fn().mockResolvedValue(null),
      findByIdForExport: jest.fn(),
      getPaginatedResumes: jest.fn(),
      getBasicResumes: jest.fn(),
      getPaginatedSnapshots: jest.fn(),
    };
    const systemLogService = { log: jest.fn() };
    const auditLogService = { log: jest.fn() };

    const useCase = new DeleteResumeUseCase(
      resumeRepository,
      resumeDefaultRepository,
      resumeQueryRepository,
      systemLogService,
      auditLogService
    );

    const result = await useCase.execute({ resumeId: 'missing', userId: 'user-1' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
    expect(resumeRepository.delete).not.toHaveBeenCalled();
  });

  it('deletes resume and returns deleted dto', async () => {
    const deletedResume = { id: 'resume-1', userId: 'user-1', isDefault: false };
    const resumeRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
      countByUserId: jest.fn(),
    };
    const resumeDefaultRepository = {
      setDefaultResume: jest.fn(),
      findOldestResumeIdByUserId: jest.fn(),
    };
    const resumeQueryRepository = {
      findById: jest.fn().mockResolvedValue(deletedResume),
      findByIdForExport: jest.fn(),
      getPaginatedResumes: jest.fn(),
      getBasicResumes: jest.fn(),
      getPaginatedSnapshots: jest.fn(),
    };
    const systemLogService = { log: jest.fn() };
    const auditLogService = { log: jest.fn() };

    const useCase = new DeleteResumeUseCase(
      resumeRepository,
      resumeDefaultRepository,
      resumeQueryRepository,
      systemLogService,
      auditLogService
    );

    const result = await useCase.execute({ resumeId: 'resume-1', userId: 'user-1' });

    expect(result.isSuccess).toBe(true);
    expect(resumeRepository.delete).toHaveBeenCalledWith('resume-1', 'user-1');
    expect(resumeDefaultRepository.setDefaultResume).not.toHaveBeenCalled();
    expect(systemLogService.log).toHaveBeenCalled();
    expect(auditLogService.log).toHaveBeenCalled();
  });

  it('promotes another resume when deleting current default', async () => {
    const deletedResume = { id: 'resume-1', userId: 'user-1', isDefault: true };
    const resumeRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
      countByUserId: jest.fn(),
    };
    const resumeDefaultRepository = {
      setDefaultResume: jest.fn().mockResolvedValue(undefined),
      findOldestResumeIdByUserId: jest.fn().mockResolvedValue('resume-2'),
    };
    const resumeQueryRepository = {
      findById: jest.fn().mockResolvedValue(deletedResume),
      findByIdForExport: jest.fn(),
      getPaginatedResumes: jest.fn(),
      getBasicResumes: jest.fn(),
      getPaginatedSnapshots: jest.fn(),
    };
    const systemLogService = { log: jest.fn() };
    const auditLogService = { log: jest.fn() };

    const useCase = new DeleteResumeUseCase(
      resumeRepository,
      resumeDefaultRepository,
      resumeQueryRepository,
      systemLogService,
      auditLogService
    );

    const result = await useCase.execute({ resumeId: 'resume-1', userId: 'user-1' });

    expect(result.isSuccess).toBe(true);
    expect(resumeDefaultRepository.findOldestResumeIdByUserId).toHaveBeenCalledWith(
      'user-1',
      'resume-1'
    );
    expect(resumeDefaultRepository.setDefaultResume).toHaveBeenCalledWith('user-1', 'resume-2');
    expect(systemLogService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          deletedResumeId: 'resume-1',
          promotedResumeId: 'resume-2',
        }),
      })
    );
  });

  it('returns unexpected error when deletion fails', async () => {
    const resumeRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn().mockRejectedValue(new Error('db failed')),
      countByUserId: jest.fn(),
    };
    const resumeDefaultRepository = {
      setDefaultResume: jest.fn(),
      findOldestResumeIdByUserId: jest.fn(),
    };
    const resumeQueryRepository = {
      findById: jest.fn().mockResolvedValue({ id: 'resume-1', userId: 'user-1', isDefault: false }),
      findByIdForExport: jest.fn(),
      getPaginatedResumes: jest.fn(),
      getBasicResumes: jest.fn(),
      getPaginatedSnapshots: jest.fn(),
    };
    const systemLogService = { log: jest.fn() };
    const auditLogService = { log: jest.fn() };

    const useCase = new DeleteResumeUseCase(
      resumeRepository,
      resumeDefaultRepository,
      resumeQueryRepository,
      systemLogService,
      auditLogService
    );

    const result = await useCase.execute({ resumeId: 'resume-1', userId: 'user-1' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });

  it('logs Unknown error message when thrown value is not Error', async () => {
    const resumeRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn().mockRejectedValue('db failed'),
      countByUserId: jest.fn(),
    };
    const resumeDefaultRepository = {
      setDefaultResume: jest.fn(),
      findOldestResumeIdByUserId: jest.fn(),
    };
    const resumeQueryRepository = {
      findById: jest.fn().mockResolvedValue({ id: 'resume-1', userId: 'user-1', isDefault: false }),
      findByIdForExport: jest.fn(),
      getPaginatedResumes: jest.fn(),
      getBasicResumes: jest.fn(),
      getPaginatedSnapshots: jest.fn(),
    };
    const systemLogService = { log: jest.fn() };
    const auditLogService = { log: jest.fn() };

    const useCase = new DeleteResumeUseCase(
      resumeRepository,
      resumeDefaultRepository,
      resumeQueryRepository,
      systemLogService,
      auditLogService
    );

    const result = await useCase.execute({ resumeId: 'resume-1', userId: 'user-1' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
    expect(systemLogService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: expect.any(String),
        message: 'Unknown error',
      })
    );
  });
});
