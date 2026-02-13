import { DeleteResumeRequestDto, DeleteResumeResponseDto } from './delete-resume.dto';

import { AuditActions } from '@/modules/audit/application/audit.actions';
import { buildAuditEntity } from '@/modules/audit/application/audit.entity';
import { IAuditLogService } from '@/modules/audit/application/services/audit-log.service.interface';
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

      await this.systemLogService.log({
        level: 'info',
        action: SystemActions.RESUME_DELETED,
        userId: request.userId,
        metadata: { resumeId: request.resumeId },
      });

      await this.auditLogService.log({
        action: AuditActions.RESUME_DELETED,
        actorUserId: request.userId,
        ...buildAuditEntity('resume', request.resumeId),
      });

      await this.resumeRepository.delete(request.resumeId, request.userId);

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
