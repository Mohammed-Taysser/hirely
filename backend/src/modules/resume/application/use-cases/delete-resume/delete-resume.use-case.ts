import { DeleteResumeRequestDto, DeleteResumeResponseDto } from './delete-resume.dto';

import { AuditActions } from '@/modules/audit/application/audit.actions';
import { buildAuditEntity } from '@/modules/audit/application/audit.entity';
import { IAuditLogService } from '@/modules/audit/application/services/audit-log.service.interface';
import { IResumeDefaultRepository } from '@/modules/resume/application/repositories/resume-default.repository.interface';
import { IResumeQueryRepository } from '@/modules/resume/application/repositories/resume.query.repository.interface';
import { IResumeRepository } from '@/modules/resume/domain/repositories/resume.repository.interface';
import { NotFoundError, UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { ISystemLogService } from '@/modules/system/application/services/system-log.service.interface';
import { SystemActions } from '@/modules/system/application/system.actions';

type DeleteResumeResponse = Result<DeleteResumeResponseDto, UnexpectedError | NotFoundError>;

export class DeleteResumeUseCase implements UseCase<DeleteResumeRequestDto, DeleteResumeResponse> {
  constructor(
    private readonly resumeRepository: IResumeRepository,
    private readonly resumeDefaultRepository: IResumeDefaultRepository,
    private readonly resumeQueryRepository: IResumeQueryRepository,
    private readonly systemLogService: ISystemLogService,
    private readonly auditLogService: IAuditLogService
  ) {}

  public async execute(request: DeleteResumeRequestDto): Promise<DeleteResumeResponse> {
    try {
      const resume = await this.resumeQueryRepository.findById(request.resumeId, request.userId);

      if (!resume) {
        return Result.fail(new NotFoundError('Resume not found'));
      }

      let promotedResumeId: string | null = null;
      if (resume.isDefault) {
        promotedResumeId = await this.resumeDefaultRepository.findOldestResumeIdByUserId(
          request.userId,
          request.resumeId
        );
      }

      await this.resumeRepository.delete(request.resumeId, request.userId);

      if (promotedResumeId) {
        await this.resumeDefaultRepository.setDefaultResume(request.userId, promotedResumeId);

        await this.systemLogService.log({
          level: 'info',
          action: SystemActions.RESUME_DEFAULT_PROMOTED,
          userId: request.userId,
          metadata: {
            deletedResumeId: request.resumeId,
            promotedResumeId,
          },
        });

        await this.auditLogService.log({
          action: AuditActions.RESUME_DEFAULT_PROMOTED,
          actorUserId: request.userId,
          ...buildAuditEntity('resume', promotedResumeId),
          metadata: {
            deletedResumeId: request.resumeId,
          },
        });
      }

      await this.systemLogService.log({
        level: 'info',
        action: SystemActions.RESUME_DELETED,
        userId: request.userId,
        metadata: {
          resumeId: request.resumeId,
          wasDefault: resume.isDefault,
          promotedResumeId,
        },
      });

      await this.auditLogService.log({
        action: AuditActions.RESUME_DELETED,
        actorUserId: request.userId,
        ...buildAuditEntity('resume', request.resumeId),
      });

      return Result.ok(resume);
    } catch (err) {
      await this.systemLogService.log({
        level: 'error',
        action: SystemActions.RESUME_DELETE_FAILED,
        userId: request.userId,
        metadata: { resumeId: request.resumeId },
        message: err instanceof Error ? err.message : 'Unknown error',
      });
      return Result.fail(new UnexpectedError(err));
    }
  }
}
