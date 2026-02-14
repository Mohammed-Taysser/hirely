import { ResumeData } from '@hirely/resume-core';

import { IResumeRepository } from '../../../domain/repositories/resume.repository.interface';
import { Resume } from '../../../domain/resume.aggregate';
import { ResumeName } from '../../../domain/value-objects/resume-name.vo';

import { AuditActions } from '@/modules/audit/application/audit.actions';
import { buildAuditEntity } from '@/modules/audit/application/audit.entity';
import { IAuditLogService } from '@/modules/audit/application/services/audit-log.service.interface';
import { IPlanLimitQueryRepository } from '@/modules/plan/application/repositories/plan-limit.query.repository.interface';
import {
  buildResumeSectionsLimitErrorMessage,
  exceedsResumeSectionsLimit,
} from '@/modules/resume/application/policies/resume-sections.policy';
import {
  buildMissingRequiredSectionsErrorMessage,
  getMissingRequiredSections,
} from '@/modules/resume/application/policies/resume-template-sections.policy';
import {
  IResumeQueryRepository,
  ResumeFullDto,
} from '@/modules/resume/application/repositories/resume.query.repository.interface';
import {
  ForbiddenError,
  UnexpectedError,
  ValidationError,
} from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { ISystemLogService } from '@/modules/system/application/services/system-log.service.interface';
import { SystemActions } from '@/modules/system/application/system.actions';

export interface CreateResumeRequestDto {
  userId: string;
  planId: string;
  name: string;
  templateId: string;
  templateVersion?: string | null;
  themeConfig?: unknown;
  data: ResumeData;
}

export type CreateResumeResponse = Result<
  ResumeFullDto,
  ValidationError | ForbiddenError | UnexpectedError
>;

export class CreateResumeUseCase implements UseCase<CreateResumeRequestDto, CreateResumeResponse> {
  constructor(
    private readonly resumeRepository: IResumeRepository,
    private readonly planLimitQueryRepository: IPlanLimitQueryRepository,
    private readonly resumeQueryRepository: IResumeQueryRepository,
    private readonly maxResumeSections: number,
    private readonly systemLogService: ISystemLogService,
    private readonly auditLogService: IAuditLogService
  ) {}

  public async execute(request: CreateResumeRequestDto): Promise<CreateResumeResponse> {
    const nameResult = ResumeName.create(request.name);

    if (nameResult.isFailure) {
      return Result.fail(new ValidationError(nameResult.error as string));
    }

    const name = nameResult.getValue();

    try {
      if (exceedsResumeSectionsLimit(request.data.sections, this.maxResumeSections)) {
        return Result.fail(
          new ValidationError(buildResumeSectionsLimitErrorMessage(this.maxResumeSections))
        );
      }

      const missingRequiredSections = getMissingRequiredSections(request.templateId, request.data);
      if (missingRequiredSections.length > 0) {
        return Result.fail(
          new ValidationError(
            buildMissingRequiredSectionsErrorMessage(request.templateId, missingRequiredSections)
          )
        );
      }

      const planLimit = await this.planLimitQueryRepository.findByPlanId(request.planId);

      if (!planLimit) {
        return Result.fail(new UnexpectedError(new Error('Plan limits are not configured')));
      }

      const currentCount = await this.resumeRepository.countByUserId(request.userId);

      if (currentCount >= planLimit.maxResumes) {
        return Result.fail(new ForbiddenError('Resume limit reached for your plan'));
      }

      const isDefault = currentCount === 0;

      const resumeResult = Resume.create({
        name,
        data: request.data,
        isDefault,
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

      const created = await this.resumeQueryRepository.findById(resume.id, request.userId);
      if (!created) {
        return Result.fail(new UnexpectedError(new Error('Created resume not found')));
      }

      await this.systemLogService.log({
        level: 'info',
        action: SystemActions.RESUME_CREATED,
        userId: request.userId,
        metadata: {
          resumeId: resume.id,
          isDefault,
          templateId: request.templateId,
          templateVersion: request.templateVersion ?? null,
        },
      });

      await this.auditLogService.log({
        action: AuditActions.RESUME_CREATED,
        actorUserId: request.userId,
        ...buildAuditEntity('resume', resume.id),
        metadata: {
          isDefault,
          templateId: request.templateId,
          templateVersion: request.templateVersion ?? null,
        },
      });

      return Result.ok(created);
    } catch (err) {
      await this.systemLogService.log({
        level: 'error',
        action: SystemActions.RESUME_CREATE_FAILED,
        userId: request.userId,
        message: err instanceof Error ? err.message : 'Unknown error',
      });
      return Result.fail(new UnexpectedError(err));
    }
  }
}
