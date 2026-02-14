import { UpdateResumeUseCase } from '@dist/modules/resume/application/use-cases/update-resume/update-resume.use-case';
import { Resume } from '@dist/modules/resume/domain/resume.aggregate';
import { ResumeName } from '@dist/modules/resume/domain/value-objects/resume-name.vo';
import {
  NotFoundError,
  UnexpectedError,
  ValidationError,
} from '@dist/modules/shared/application/app-error';

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

const buildResumeAggregate = (userId: string, resumeId: string) => {
  const nameResult = ResumeName.create('Existing Resume');
  if (nameResult.isFailure) {
    throw new Error('Failed to create resume name for test setup');
  }

  const resumeResult = Resume.create(
    {
      name: nameResult.getValue(),
      userId,
      templateId: 'classic',
      templateVersion: null,
      themeConfig: null,
      data: buildResumeData(1),
    },
    resumeId
  );

  if (resumeResult.isFailure) {
    throw new Error('Failed to create resume aggregate for test setup');
  }

  return resumeResult.getValue();
};

const buildDependencies = () => {
  const resumeRepository = {
    save: jest.fn(async (): Promise<void> => undefined),
    findById: jest.fn(async (_resumeId: string, userId: string) => buildResumeAggregate(userId, 'resume-1')),
    delete: jest.fn(async (): Promise<void> => undefined),
    countByUserId: jest.fn(async (): Promise<number> => 1),
  };

  const resumeSnapshotRepository = {
    createSnapshot: jest.fn(
      async (): Promise<{ id: string; resumeId: string; userId: string; data: unknown; createdAt: Date }> => ({
        id: 'snapshot-1',
        resumeId: 'resume-1',
        userId: 'user-1',
        data: buildResumeData(1),
        createdAt: new Date(),
      })
    ),
  };

  const updatedResume = {
    id: 'resume-1',
    name: 'Existing Resume',
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    data: buildResumeData(1),
  };

  const resumeQueryRepository = {
    findById: jest.fn(async (): Promise<typeof updatedResume> => updatedResume),
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

  const useCase = new UpdateResumeUseCase(
    resumeRepository,
    resumeSnapshotRepository,
    resumeQueryRepository,
    2,
    systemLogService,
    auditLogService
  );

  return {
    useCase,
    resumeRepository,
    resumeSnapshotRepository,
    resumeQueryRepository,
    systemLogService,
    auditLogService,
  };
};

describe('UpdateResumeUseCase', () => {
  it('returns not found when resume does not exist', async () => {
    const deps = buildDependencies();
    deps.resumeRepository.findById.mockResolvedValue(null);

    const result = await deps.useCase.execute({
      resumeId: 'missing-resume',
      userId: 'user-1',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
    expect(deps.resumeRepository.save).not.toHaveBeenCalled();
  });

  it('rejects invalid name update', async () => {
    const deps = buildDependencies();

    const result = await deps.useCase.execute({
      resumeId: 'resume-1',
      userId: 'user-1',
      name: '   ',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ValidationError);
    expect(deps.resumeRepository.save).not.toHaveBeenCalled();
  });

  it('rejects oversized sections before save and snapshot', async () => {
    const deps = buildDependencies();

    const result = await deps.useCase.execute({
      resumeId: 'resume-1',
      userId: 'user-1',
      data: buildResumeData(3),
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ValidationError);
    expect(result.error?.message).toBe('Max sections per resume is 2');
    expect(deps.resumeRepository.save).not.toHaveBeenCalled();
    expect(deps.resumeSnapshotRepository.createSnapshot).not.toHaveBeenCalled();
  });

  it('fails when template required sections are missing after data update', async () => {
    const deps = buildDependencies();

    const result = await deps.useCase.execute({
      resumeId: 'resume-1',
      userId: 'user-1',
      data: buildExperienceOnlyResumeData(1) as never,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ValidationError);
    expect(result.error?.message).toBe('Template "classic" requires sections: summary');
    expect(deps.resumeRepository.save).not.toHaveBeenCalled();
    expect(deps.resumeSnapshotRepository.createSnapshot).not.toHaveBeenCalled();
    expect(deps.systemLogService.log).not.toHaveBeenCalled();
    expect(deps.auditLogService.log).not.toHaveBeenCalled();
  });

  it('returns not found when snapshot could not be created', async () => {
    const deps = buildDependencies();
    deps.resumeSnapshotRepository.createSnapshot.mockResolvedValue(null);

    const result = await deps.useCase.execute({
      resumeId: 'resume-1',
      userId: 'user-1',
      data: buildResumeData(2),
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
  });

  it('returns not found when read model does not have updated resume', async () => {
    const deps = buildDependencies();
    deps.resumeQueryRepository.findById.mockResolvedValue(null);

    const result = await deps.useCase.execute({
      resumeId: 'resume-1',
      userId: 'user-1',
      data: buildResumeData(2),
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
  });

  it('updates resume and writes logs for changed fields', async () => {
    const deps = buildDependencies();

    const result = await deps.useCase.execute({
      resumeId: 'resume-1',
      userId: 'user-1',
      name: 'Updated Resume',
      data: buildResumeData(2),
      templateId: 'modern',
      templateVersion: 'v2',
      themeConfig: { color: '#000000' },
    });

    expect(result.isSuccess).toBe(true);
    expect(deps.resumeRepository.save).toHaveBeenCalledTimes(1);
    expect(deps.resumeSnapshotRepository.createSnapshot).toHaveBeenCalledTimes(1);
    expect(deps.systemLogService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'info',
        metadata: expect.objectContaining({
          updatedFields: {
            name: true,
            data: true,
            templateId: true,
            themeConfig: true,
          },
        }),
      })
    );
    expect(deps.auditLogService.log).toHaveBeenCalledTimes(1);
  });

  it('updates resume with no mutable fields and logs false updated flags', async () => {
    const deps = buildDependencies();

    const result = await deps.useCase.execute({
      resumeId: 'resume-1',
      userId: 'user-1',
    });

    expect(result.isSuccess).toBe(true);
    expect(deps.resumeRepository.save).toHaveBeenCalledTimes(1);
    expect(deps.systemLogService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          updatedFields: {
            name: false,
            data: false,
            templateId: false,
            themeConfig: false,
          },
        }),
      })
    );
  });

  it('logs failure and returns unexpected error on thrown exception', async () => {
    const deps = buildDependencies();
    deps.resumeRepository.findById.mockRejectedValue(new Error('db down'));

    const result = await deps.useCase.execute({
      resumeId: 'resume-1',
      userId: 'user-1',
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

  it('logs Unknown error when thrown value is not Error', async () => {
    const deps = buildDependencies();
    deps.resumeRepository.findById.mockRejectedValue('db down');

    const result = await deps.useCase.execute({
      resumeId: 'resume-1',
      userId: 'user-1',
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
});
