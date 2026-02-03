import { ResumeData } from '@hirely/resume-core';

import { IResumeRepository } from '../../../domain/repositories/resume.repository.interface';
import { Resume } from '../../../domain/resume.aggregate';
import { ResumeName } from '../../../domain/value-objects/resume-name.vo';

import { ForbiddenError, UnexpectedError, ValidationError } from '@/modules/shared/application/app-error';
import { IPlanLimitQueryRepository } from '@/modules/plan/application/repositories/plan-limit.query.repository.interface';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';

export interface CreateResumeRequestDto {
  userId: string;
  planId: string;
  name: string;
  templateId: string;
  templateVersion?: string | null;
  themeConfig?: unknown;
  data: ResumeData;
}

export type CreateResumeResponse = Result<Resume, ValidationError | ForbiddenError | UnexpectedError>;

export class CreateResumeUseCase implements UseCase<CreateResumeRequestDto, CreateResumeResponse> {
  constructor(
    private readonly resumeRepository: IResumeRepository,
    private readonly planLimitQueryRepository: IPlanLimitQueryRepository
  ) {}

  public async execute(request: CreateResumeRequestDto): Promise<CreateResumeResponse> {
    const nameResult = ResumeName.create(request.name);

    if (nameResult.isFailure) {
      return Result.fail(new ValidationError(nameResult.error as string));
    }

    const name = nameResult.getValue();

    try {
      const planLimit = await this.planLimitQueryRepository.findByPlanId(request.planId);

      if (!planLimit) {
        return Result.fail(new UnexpectedError(new Error('Plan limits are not configured')));
      }

      const currentCount = await this.resumeRepository.countByUserId(request.userId);

      if (currentCount >= planLimit.maxResumes) {
        return Result.fail(new ForbiddenError('Resume limit reached for your plan'));
      }

      const resumeResult = Resume.create({
        name,
        data: request.data,
        templateId: request.templateId,
        templateVersion: request.templateVersion,
        themeConfig: request.themeConfig,
        userId: request.userId,
      });

      if (resumeResult.isFailure) {
        return Result.fail(new ValidationError(resumeResult.error as string));
      }

      const resume = resumeResult.getValue();

      await this.resumeRepository.save(resume);

      return Result.ok(resume);
    } catch (err) {
      return Result.fail(new UnexpectedError(err));
    }
  }
}
