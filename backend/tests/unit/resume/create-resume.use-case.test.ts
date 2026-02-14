import { CreateResumeUseCase } from '@dist/modules/resume/application/use-cases/create-resume/create-resume.use-case';
import { Resume } from '@dist/modules/resume/domain/resume.aggregate';
import {
  ForbiddenError,
  UnexpectedError,
  ValidationError,
} from '@dist/modules/shared/application/app-error';
import { Result } from '@dist/modules/shared/domain/result';

type SummarySection = {
  type: 'summary';
  content: { text: string };
};

type ExperienceSection = {
  type: 'experience';
  content: { company: string; role: string };
};

const buildResumeData = (
  sectionsCount: number
): { meta: { title: string; language: string }; sections: Record<string, SummarySection> } => {
  const sections: Record<string, SummarySection> = {};

  for (let index = 0; index < sectionsCount; index += 1) {
    sections[`section-${index}`] = {
      type: 'summary',
      content: { text: `Summary ${index}` },
    };
  }

  return {
    meta: { title: 'Resume Title', language: 'en' },
    sections,
  };
};

const buildExperienceOnlyResumeData = (
  sectionsCount: number
): { meta: { title: string; language: string }; sections: Record<string, ExperienceSection> } => {
  const sections: Record<string, ExperienceSection> = {};

  for (let index = 0; index < sectionsCount; index += 1) {
    sections[`section-${index}`] = {
      type: 'experience',
      content: { company: `Company ${index}`, role: `Role ${index}` },
    };
  }

  return {
    meta: { title: 'Resume Title', language: 'en' },
    sections,
  };
};

const buildDependencies = () => {
  const resumeRepository = {
    save: jest.fn(async (): Promise<void> => undefined),
    findById: jest.fn(async (): Promise<null> => null),
    delete: jest.fn(async (): Promise<void> => undefined),
    countByUserId: jest.fn(async (): Promise<number> => 0),
  };

  const planLimitQueryRepository = {
    findByPlanId: jest.fn(
      async (): Promise<{
        id: string;
        planId: string;
        maxResumes: number;
        maxExports: number;
        dailyUploadMb: number;
        dailyExports: number;
        dailyExportEmails: number;
        dailyBulkApplies: number;
        createdAt: Date;
        updatedAt: Date;
      }> => ({
        id: 'limit-1',
        planId: 'plan-1',
        maxResumes: 10,
        maxExports: 10,
        dailyUploadMb: 10,
        dailyExports: 10,
        dailyExportEmails: 20,
        dailyBulkApplies: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    ),
  };

  const createdResume = {
    id: 'resume-1',
    name: 'My Resume',
    userId: 'user-1',
    isDefault: true,
    templateId: 'classic',
    templateVersion: null,
    themeConfig: null,
    data: buildResumeData(2),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const resumeQueryRepository = {
    findById: jest.fn(async (): Promise<typeof createdResume> => createdResume),
    findByIdForExport: jest.fn(async (): Promise<null> => null),
    getPaginatedResumes: jest.fn(async (): Promise<[never[], number]> => [[], 0]),
    getBasicResumes: jest.fn(async (): Promise<never[]> => []),
    getPaginatedSnapshots: jest.fn(async (): Promise<[never[], number]> => [[], 0]),
  };

  const systemLogService = {
    log: jest.fn(async (): Promise<void> => undefined),
  };

  const auditLogService = {
    log: jest.fn(async (): Promise<void> => undefined),
  };

  const useCase = new CreateResumeUseCase(
    resumeRepository,
    planLimitQueryRepository,
    resumeQueryRepository,
    2,
    systemLogService,
    auditLogService
  );

  return {
    useCase,
    resumeRepository,
    planLimitQueryRepository,
    resumeQueryRepository,
    systemLogService,
    auditLogService,
  };
};

describe('CreateResumeUseCase', () => {
  it('rejects invalid resume name before downstream checks', async () => {
    const deps = buildDependencies();

    const result = await deps.useCase.execute({
      userId: 'user-1',
      planId: 'plan-1',
      name: '',
      templateId: 'classic',
      data: buildResumeData(1),
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ValidationError);
    expect(deps.planLimitQueryRepository.findByPlanId).not.toHaveBeenCalled();
  });

  it('rejects oversized sections before persistence calls', async () => {
    const deps = buildDependencies();

    const result = await deps.useCase.execute({
      userId: 'user-1',
      planId: 'plan-1',
      name: 'My Resume',
      templateId: 'classic',
      data: buildResumeData(3),
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ValidationError);
    expect(result.error?.message).toBe('Max sections per resume is 2');
    expect(deps.planLimitQueryRepository.findByPlanId).not.toHaveBeenCalled();
    expect(deps.resumeRepository.countByUserId).not.toHaveBeenCalled();
    expect(deps.resumeRepository.save).not.toHaveBeenCalled();
    expect(deps.resumeQueryRepository.findById).not.toHaveBeenCalled();
    expect(deps.systemLogService.log).not.toHaveBeenCalled();
    expect(deps.auditLogService.log).not.toHaveBeenCalled();
  });

  it('fails when plan limits are missing', async () => {
    const deps = buildDependencies();
    deps.planLimitQueryRepository.findByPlanId.mockResolvedValue(null);

    const result = await deps.useCase.execute({
      userId: 'user-1',
      planId: 'plan-1',
      name: 'My Resume',
      templateId: 'classic',
      data: buildResumeData(2),
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ForbiddenError);
  });

  it('fails when template required sections are missing', async () => {
    const deps = buildDependencies();

    const result = await deps.useCase.execute({
      userId: 'user-1',
      planId: 'plan-1',
      name: 'My Resume',
      templateId: 'classic',
      data: buildExperienceOnlyResumeData(1) as never,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ValidationError);
    expect(result.error?.message).toBe('Template "classic" requires sections: summary');
    expect(deps.planLimitQueryRepository.findByPlanId).not.toHaveBeenCalled();
  });

  it('fails when resume plan quota is reached', async () => {
    const deps = buildDependencies();
    deps.resumeRepository.countByUserId.mockResolvedValue(10);

    const result = await deps.useCase.execute({
      userId: 'user-1',
      planId: 'plan-1',
      name: 'My Resume',
      templateId: 'classic',
      data: buildResumeData(2),
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ForbiddenError);
    expect(deps.resumeRepository.save).not.toHaveBeenCalled();
  });

  it('marks first user resume as default', async () => {
    const deps = buildDependencies();
    deps.resumeRepository.countByUserId.mockResolvedValue(0);

    const result = await deps.useCase.execute({
      userId: 'user-1',
      planId: 'plan-1',
      name: 'My Resume',
      templateId: 'classic',
      data: buildResumeData(2),
    });

    expect(result.isSuccess).toBe(true);
    expect(deps.resumeRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        isDefault: true,
      })
    );
  });

  it('does not mark non-first resume as default', async () => {
    const deps = buildDependencies();
    deps.resumeRepository.countByUserId.mockResolvedValue(2);

    const result = await deps.useCase.execute({
      userId: 'user-1',
      planId: 'plan-1',
      name: 'My Resume',
      templateId: 'classic',
      data: buildResumeData(2),
    });

    expect(result.isSuccess).toBe(true);
    expect(deps.resumeRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        isDefault: false,
      })
    );
  });

  it('fails when read model does not return created resume', async () => {
    const deps = buildDependencies();
    deps.resumeQueryRepository.findById.mockResolvedValue(null);

    const result = await deps.useCase.execute({
      userId: 'user-1',
      planId: 'plan-1',
      name: 'My Resume',
      templateId: 'classic',
      data: buildResumeData(2),
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });

  it('returns created resume and writes system/audit logs', async () => {
    const deps = buildDependencies();

    const result = await deps.useCase.execute({
      userId: 'user-1',
      planId: 'plan-1',
      name: 'My Resume',
      templateId: 'classic',
      data: buildResumeData(2),
    });

    expect(result.isSuccess).toBe(true);
    expect(deps.resumeRepository.save).toHaveBeenCalledTimes(1);
    expect(deps.systemLogService.log).toHaveBeenCalledTimes(1);
    expect(deps.auditLogService.log).toHaveBeenCalledTimes(1);
  });

  it('writes templateVersion metadata when provided', async () => {
    const deps = buildDependencies();

    const result = await deps.useCase.execute({
      userId: 'user-1',
      planId: 'plan-1',
      name: 'My Resume',
      templateId: 'modern',
      templateVersion: 'v2',
      data: buildResumeData(2),
    });

    expect(result.isSuccess).toBe(true);
    expect(deps.systemLogService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          templateId: 'modern',
          templateVersion: 'v2',
        }),
      })
    );
    expect(deps.auditLogService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          templateId: 'modern',
          templateVersion: 'v2',
        }),
      })
    );
  });

  it('logs failure and returns unexpected error on thrown exception', async () => {
    const deps = buildDependencies();
    deps.resumeRepository.save.mockRejectedValue(new Error('db down'));

    const result = await deps.useCase.execute({
      userId: 'user-1',
      planId: 'plan-1',
      name: 'My Resume',
      templateId: 'classic',
      data: buildResumeData(2),
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
    expect(deps.systemLogService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'error',
      })
    );
  });

  it('logs Unknown error message when thrown value is not Error', async () => {
    const deps = buildDependencies();
    deps.resumeRepository.save.mockRejectedValue('db down');

    const result = await deps.useCase.execute({
      userId: 'user-1',
      planId: 'plan-1',
      name: 'My Resume',
      templateId: 'classic',
      data: buildResumeData(2),
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
    expect(deps.systemLogService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Unknown error',
      })
    );
  });

  it('returns validation error when resume aggregate creation fails', async () => {
    const deps = buildDependencies();
    const createSpy = jest.spyOn(Resume, 'create').mockImplementationOnce(() => {
      return Result.fail('Invalid resume aggregate');
    });

    const result = await deps.useCase.execute({
      userId: 'user-1',
      planId: 'plan-1',
      name: 'My Resume',
      templateId: 'classic',
      data: buildResumeData(2),
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ValidationError);
    createSpy.mockRestore();
  });
});
