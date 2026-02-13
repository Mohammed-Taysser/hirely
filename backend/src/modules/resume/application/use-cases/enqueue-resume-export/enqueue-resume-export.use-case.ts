import {
  EnqueueResumeExportRequestDto,
  EnqueueResumeExportResponseDto,
} from './enqueue-resume-export.dto';

import { AuditActions } from '@/modules/audit/application/audit.actions';
import { buildAuditEntity } from '@/modules/audit/application/audit.entity';
import { IAuditLogService } from '@/modules/audit/application/services/audit-log.service.interface';
import { canDirectDownload } from '@/modules/resume/application/policies/export.policy';
import { IResumeSnapshotRepository } from '@/modules/resume/application/repositories/resume-snapshot.repository.interface';
import { IExportQueueService } from '@/modules/resume/application/services/export-queue.service.interface';
import { IExportService } from '@/modules/resume/application/services/export.service.interface';
import {
  AppError,
  NotFoundError,
  TooManyRequestsError,
  UnexpectedError,
} from '@/modules/shared/application/app-error';
import { IRateLimiter } from '@/modules/shared/application/services/rate-limiter.service.interface';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { ISystemLogService } from '@/modules/system/application/services/system-log.service.interface';
import { SystemActions } from '@/modules/system/application/system.actions';
import { IUserQueryRepository } from '@/modules/user/application/repositories/user.query.repository.interface';

type EnqueueResumeExportResponse = Result<EnqueueResumeExportResponseDto, AppError>;

export class EnqueueResumeExportUseCase implements UseCase<
  EnqueueResumeExportRequestDto,
  EnqueueResumeExportResponse
> {
  constructor(
    private readonly exportService: IExportService,
    private readonly exportQueueService: IExportQueueService,
    private readonly resumeSnapshotRepository: IResumeSnapshotRepository,
    private readonly userQueryRepository: IUserQueryRepository,
    private readonly rateLimiter: IRateLimiter,
    private readonly systemLogService: ISystemLogService,
    private readonly auditLogService: IAuditLogService
  ) {}

  public async execute(
    request: EnqueueResumeExportRequestDto
  ): Promise<EnqueueResumeExportResponse> {
    try {
      const allowed = await this.rateLimiter.consume({
        key: `rate:export:${request.user.id}`,
        max: 50,
        windowSeconds: 120,
      });

      if (!allowed) {
        return Result.fail(new TooManyRequestsError('Export rate limit exceeded'));
      }

      const user = await this.userQueryRepository.findById(request.user.id);
      if (!user?.planId || !user.plan?.code) {
        return Result.fail(new NotFoundError('User plan not found'));
      }

      await this.exportService.enforceExportLimit(request.user.id, user.planId);

      const snapshot = await this.resumeSnapshotRepository.createSnapshot(
        request.user.id,
        request.resumeId
      );

      if (!snapshot) {
        return Result.fail(new NotFoundError('Resume not found'));
      }

      const exportRecord = await this.exportService.createExportRecord(
        request.user.id,
        snapshot.id
      );

      await this.exportQueueService.enqueuePdf({
        exportId: exportRecord.id,
        snapshotId: snapshot.id,
        userId: request.user.id,
      });

      const delivery = canDirectDownload(user.plan.code) ? 'download' : 'email';

      await this.systemLogService.log({
        level: 'info',
        action: SystemActions.RESUME_EXPORT_ENQUEUED,
        userId: request.user.id,
        metadata: {
          exportId: exportRecord.id,
          resumeId: request.resumeId,
          delivery,
        },
      });

      await this.auditLogService.log({
        action: AuditActions.EXPORT_ENQUEUED,
        actorUserId: request.user.id,
        ...buildAuditEntity('resumeExport', exportRecord.id),
        metadata: {
          resumeId: request.resumeId,
          snapshotId: snapshot.id,
          delivery,
        },
      });

      return Result.ok({
        exportId: exportRecord.id,
        delivery,
      });
    } catch (err) {
      await this.systemLogService.log({
        level: 'error',
        action: SystemActions.RESUME_EXPORT_ENQUEUE_FAILED,
        userId: request.user.id,
        metadata: { resumeId: request.resumeId },
        message: err instanceof Error ? err.message : 'Unknown error',
      });

      if (err instanceof AppError) {
        return Result.fail(err);
      }
      return Result.fail(new UnexpectedError(err));
    }
  }
}
