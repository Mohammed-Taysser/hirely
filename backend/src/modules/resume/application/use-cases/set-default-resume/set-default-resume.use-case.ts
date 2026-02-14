import { SetDefaultResumeRequestDto, SetDefaultResumeResponseDto } from './set-default-resume.dto';

import { AuditActions } from '@/modules/audit/application/audit.actions';
import { buildAuditEntity } from '@/modules/audit/application/audit.entity';
import { IAuditLogService } from '@/modules/audit/application/services/audit-log.service.interface';
import { IResumeDefaultRepository } from '@/modules/resume/application/repositories/resume-default.repository.interface';
import { IResumeQueryRepository } from '@/modules/resume/application/repositories/resume.query.repository.interface';
import { NotFoundError, UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { ISystemLogService } from '@/modules/system/application/services/system-log.service.interface';
import { SystemActions } from '@/modules/system/application/system.actions';

type SetDefaultResumeResponse = Result<
  SetDefaultResumeResponseDto,
  NotFoundError | UnexpectedError
>;

export class SetDefaultResumeUseCase implements UseCase<
  SetDefaultResumeRequestDto,
  SetDefaultResumeResponse
> {
  constructor(
    private readonly resumeDefaultRepository: IResumeDefaultRepository,
    private readonly resumeQueryRepository: IResumeQueryRepository,
    private readonly systemLogService: ISystemLogService,
    private readonly auditLogService: IAuditLogService
  ) {}

  public async execute(request: SetDefaultResumeRequestDto): Promise<SetDefaultResumeResponse> {
    try {
      const currentResume = await this.resumeQueryRepository.findById(
        request.resumeId,
        request.userId
      );

      if (!currentResume) {
        return Result.fail(new NotFoundError('Resume not found'));
      }

      if (!currentResume.isDefault) {
        await this.resumeDefaultRepository.setDefaultResume(request.userId, request.resumeId);
      }

      const updatedResume = await this.resumeQueryRepository.findById(
        request.resumeId,
        request.userId
      );
      if (!updatedResume) {
        return Result.fail(new NotFoundError('Resume not found'));
      }

      await this.systemLogService.log({
        level: 'info',
        action: SystemActions.RESUME_DEFAULT_SET,
        userId: request.userId,
        metadata: {
          resumeId: request.resumeId,
          alreadyDefault: currentResume.isDefault,
        },
      });

      await this.auditLogService.log({
        action: AuditActions.RESUME_DEFAULT_SET,
        actorUserId: request.userId,
        ...buildAuditEntity('resume', request.resumeId),
      });

      return Result.ok(updatedResume);
    } catch (err) {
      await this.systemLogService.log({
        level: 'error',
        action: SystemActions.RESUME_DEFAULT_SET_FAILED,
        userId: request.userId,
        metadata: { resumeId: request.resumeId },
        message: err instanceof Error ? err.message : 'Unknown error',
      });
      return Result.fail(new UnexpectedError(err));
    }
  }
}
