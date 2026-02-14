import {
  RetryFailedExportRequestDto,
  RetryFailedExportResponseDto,
} from './retry-failed-export.dto';

import { AuditActions } from '@/modules/audit/application/audit.actions';
import { buildAuditEntity } from '@/modules/audit/application/audit.entity';
import { IAuditLogService } from '@/modules/audit/application/services/audit-log.service.interface';
import { IResumeExportQueryRepository } from '@/modules/resume/application/repositories/resume-export.query.repository.interface';
import { IResumeExportRepository } from '@/modules/resume/application/repositories/resume-export.repository.interface';
import { IExportQueueService } from '@/modules/resume/application/services/export-queue.service.interface';
import {
  AppError,
  ConflictError,
  NotFoundError,
  TooManyRequestsError,
  UnexpectedError,
} from '@/modules/shared/application/app-error';
import { IRateLimiter } from '@/modules/shared/application/services/rate-limiter.service.interface';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { ISystemLogService } from '@/modules/system/application/services/system-log.service.interface';
import { SystemActions } from '@/modules/system/application/system.actions';

type RetryFailedExportResponse = Result<RetryFailedExportResponseDto, AppError>;

export class RetryFailedExportUseCase implements UseCase<
  RetryFailedExportRequestDto,
  RetryFailedExportResponse
> {
  constructor(
    private readonly resumeExportQueryRepository: IResumeExportQueryRepository,
    private readonly resumeExportRepository: IResumeExportRepository,
    private readonly exportQueueService: IExportQueueService,
    private readonly rateLimiter: IRateLimiter,
    private readonly rateLimitConfig: { max: number; windowSeconds: number },
    private readonly systemLogService: ISystemLogService,
    private readonly auditLogService: IAuditLogService
  ) {}

  async execute(request: RetryFailedExportRequestDto): Promise<RetryFailedExportResponse> {
    try {
      const allowed = await this.rateLimiter.consume({
        key: `rate:export-retry:${request.userId}`,
        max: this.rateLimitConfig.max,
        windowSeconds: this.rateLimitConfig.windowSeconds,
      });

      if (!allowed) {
        return Result.fail(new TooManyRequestsError('Export retry rate limit exceeded'));
      }

      const exportRecord = await this.resumeExportQueryRepository.findById(
        request.userId,
        request.exportId
      );
      if (!exportRecord) {
        return Result.fail(new NotFoundError('Export not found'));
      }
      if (exportRecord.status !== 'FAILED') {
        return Result.fail(new ConflictError('Only failed exports can be retried'));
      }

      await this.resumeExportRepository.markPending(request.exportId);
      await this.exportQueueService.enqueuePdf({
        exportId: request.exportId,
        snapshotId: exportRecord.snapshotId,
        userId: request.userId,
      });

      await this.systemLogService.log({
        level: 'info',
        action: SystemActions.RESUME_EXPORT_RETRY_ENQUEUED,
        userId: request.userId,
        metadata: {
          exportId: request.exportId,
          resumeId: exportRecord.resumeId,
          snapshotId: exportRecord.snapshotId,
        },
      });

      await this.auditLogService.log({
        action: AuditActions.EXPORT_RETRY_ENQUEUED,
        actorUserId: request.userId,
        ...buildAuditEntity('resumeExport', request.exportId),
        metadata: {
          resumeId: exportRecord.resumeId,
          snapshotId: exportRecord.snapshotId,
        },
      });

      return Result.ok({ exportId: request.exportId, status: 'PENDING' });
    } catch (error) {
      await this.systemLogService.log({
        level: 'error',
        action: SystemActions.RESUME_EXPORT_RETRY_FAILED,
        userId: request.userId,
        metadata: { exportId: request.exportId },
        message: error instanceof Error ? error.message : 'Unknown error',
      });

      if (error instanceof AppError) {
        return Result.fail(error);
      }

      return Result.fail(new UnexpectedError(error));
    }
  }
}
