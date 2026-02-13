import { UpdateResumeRequestDto, UpdateResumeResponseDto } from './update-resume.dto';

import { AuditActions } from '@/modules/audit/application/audit.actions';
import { buildAuditEntity } from '@/modules/audit/application/audit.entity';
import { IAuditLogService } from '@/modules/audit/application/services/audit-log.service.interface';
import { IResumeSnapshotRepository } from '@/modules/resume/application/repositories/resume-snapshot.repository.interface';
import { IResumeQueryRepository } from '@/modules/resume/application/repositories/resume.query.repository.interface';
import { IResumeRepository } from '@/modules/resume/domain/repositories/resume.repository.interface';
import { ResumeName } from '@/modules/resume/domain/value-objects/resume-name.vo';
import {
  NotFoundError,
  UnexpectedError,
  ValidationError,
} from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { ISystemLogService } from '@/modules/system/application/services/system-log.service.interface';
import { SystemActions } from '@/modules/system/application/system.actions';

type UpdateResumeResponse = Result<
  UpdateResumeResponseDto,
  ValidationError | UnexpectedError | NotFoundError
>;

export class UpdateResumeUseCase implements UseCase<UpdateResumeRequestDto, UpdateResumeResponse> {
  constructor(
    private readonly resumeRepository: IResumeRepository,
    private readonly resumeSnapshotRepository: IResumeSnapshotRepository,
    private readonly resumeQueryRepository: IResumeQueryRepository,
    private readonly systemLogService: ISystemLogService,
    private readonly auditLogService: IAuditLogService
  ) {}

  public async execute(request: UpdateResumeRequestDto): Promise<UpdateResumeResponse> {
    try {
      const resume = await this.resumeRepository.findById(request.resumeId, request.userId);

      if (!resume) {
        return Result.fail(new NotFoundError('Resume not found'));
      }

      if (request.name) {
        const nameOrError = ResumeName.create(request.name);
        if (nameOrError.isFailure) {
          return Result.fail(new ValidationError(nameOrError.error as string));
        }
        resume.rename(nameOrError.getValue());
      }

      if (request.data) {
        resume.updateData(request.data);
      }

      if (request.templateId) {
        resume.changeTemplate(request.templateId, request.templateVersion);
      }

      if (request.themeConfig) {
        resume.updateTheme(request.themeConfig);
      }

      await this.resumeRepository.save(resume);

      const snapshot = await this.resumeSnapshotRepository.createSnapshot(
        request.userId,
        request.resumeId
      );

      if (!snapshot) {
        return Result.fail(new NotFoundError('Resume snapshot not found'));
      }

      const updated = await this.resumeQueryRepository.findById(request.resumeId, request.userId);

      if (!updated) {
        return Result.fail(new NotFoundError('Resume not found'));
      }

      await this.systemLogService.log({
        level: 'info',
        action: SystemActions.RESUME_UPDATED,
        userId: request.userId,
        metadata: {
          resumeId: request.resumeId,
          updatedFields: {
            name: Boolean(request.name),
            data: Boolean(request.data),
            templateId: Boolean(request.templateId),
            themeConfig: Boolean(request.themeConfig),
          },
        },
      });

      await this.auditLogService.log({
        action: AuditActions.RESUME_UPDATED,
        actorUserId: request.userId,
        ...buildAuditEntity('resume', request.resumeId),
        metadata: {
          updatedFields: {
            name: Boolean(request.name),
            data: Boolean(request.data),
            templateId: Boolean(request.templateId),
            themeConfig: Boolean(request.themeConfig),
          },
        },
      });

      return Result.ok(updated);
    } catch (err) {
      await this.systemLogService.log({
        level: 'error',
        action: SystemActions.RESUME_UPDATE_FAILED,
        userId: request.userId,
        metadata: { resumeId: request.resumeId },
        message: err instanceof Error ? err.message : 'Unknown error',
      });
      return Result.fail(new UnexpectedError(err));
    }
  }
}
