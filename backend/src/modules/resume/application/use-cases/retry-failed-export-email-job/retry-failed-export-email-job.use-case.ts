import {
  RetryFailedExportEmailJobRequestDto,
  RetryFailedExportEmailJobResponseDto,
} from './retry-failed-export-email-job.dto';

import { AuditActions } from '@/modules/audit/application/audit.actions';
import { buildAuditEntity } from '@/modules/audit/application/audit.entity';
import { IAuditLogService } from '@/modules/audit/application/services/audit-log.service.interface';
import { IResumeExportQueryRepository } from '@/modules/resume/application/repositories/resume-export.query.repository.interface';
import { IBulkApplyEmailQueueService } from '@/modules/resume/application/services/bulk-apply-email-queue.service.interface';
import { IExportEmailQueueService } from '@/modules/resume/application/services/export-email-queue.service.interface';
import {
  AppError,
  ConflictError,
  NotFoundError,
  TooManyRequestsError,
  UnexpectedError,
  ValidationError,
} from '@/modules/shared/application/app-error';
import { IRateLimiter } from '@/modules/shared/application/services/rate-limiter.service.interface';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { ISystemLogQueryRepository } from '@/modules/system/application/repositories/system-log.query.repository.interface';
import { ISystemLogService } from '@/modules/system/application/services/system-log.service.interface';
import { SystemActions } from '@/modules/system/application/system.actions';

type RetryFailedExportEmailJobResponse = Result<RetryFailedExportEmailJobResponseDto, AppError>;

type RetryEmailPayload = {
  exportId: string;
  to: string;
  reason: 'free-tier-export' | 'bulk-apply';
  recipient?: {
    name?: string;
    company?: string;
    message?: string;
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseRetryEmailPayload = (metadata: Record<string, unknown> | null): RetryEmailPayload => {
  if (!metadata) {
    throw new ValidationError('Failed email log payload is missing');
  }

  const exportId = metadata.exportId;
  const to = metadata.to;
  const reason = metadata.reason;

  if (typeof exportId !== 'string' || exportId.trim().length === 0) {
    throw new ValidationError('Failed email log missing exportId');
  }
  if (typeof to !== 'string' || to.trim().length === 0) {
    throw new ValidationError('Failed email log missing recipient email');
  }
  if (reason !== 'free-tier-export' && reason !== 'bulk-apply') {
    throw new ValidationError('Failed email log missing valid reason');
  }

  const recipientRaw = metadata.recipient;
  const recipient = isRecord(recipientRaw)
    ? {
        name: typeof recipientRaw.name === 'string' ? recipientRaw.name : undefined,
        company: typeof recipientRaw.company === 'string' ? recipientRaw.company : undefined,
        message: typeof recipientRaw.message === 'string' ? recipientRaw.message : undefined,
      }
    : undefined;

  return {
    exportId: exportId.trim(),
    to: to.trim(),
    reason,
    recipient,
  };
};

export class RetryFailedExportEmailJobUseCase implements UseCase<
  RetryFailedExportEmailJobRequestDto,
  RetryFailedExportEmailJobResponse
> {
  constructor(
    private readonly systemLogQueryRepository: ISystemLogQueryRepository,
    private readonly resumeExportQueryRepository: IResumeExportQueryRepository,
    private readonly exportEmailQueueService: IExportEmailQueueService,
    private readonly bulkApplyEmailQueueService: IBulkApplyEmailQueueService,
    private readonly rateLimiter: IRateLimiter,
    private readonly rateLimitConfig: { max: number; windowSeconds: number },
    private readonly systemLogService: ISystemLogService,
    private readonly auditLogService: IAuditLogService
  ) {}

  async execute(
    request: RetryFailedExportEmailJobRequestDto
  ): Promise<RetryFailedExportEmailJobResponse> {
    try {
      const allowed = await this.rateLimiter.consume({
        key: `rate:export-email-retry:${request.userId}`,
        max: this.rateLimitConfig.max,
        windowSeconds: this.rateLimitConfig.windowSeconds,
      });

      if (!allowed) {
        return Result.fail(new TooManyRequestsError('Export email retry rate limit exceeded'));
      }

      const failedJob = await this.systemLogQueryRepository.findFailedExportEmailJobById(
        request.userId,
        request.failedJobId
      );
      if (!failedJob) {
        return Result.fail(new NotFoundError('Failed export email job not found'));
      }

      const payload = parseRetryEmailPayload(failedJob.metadata);
      const exportRecord = await this.resumeExportQueryRepository.findById(
        request.userId,
        payload.exportId
      );
      if (!exportRecord) {
        return Result.fail(new NotFoundError('Export not found'));
      }
      if (exportRecord.status !== 'READY') {
        return Result.fail(new ConflictError('Export must be ready before retrying email'));
      }

      if (payload.reason === 'bulk-apply') {
        await this.bulkApplyEmailQueueService.enqueue({
          exportId: payload.exportId,
          userId: request.userId,
          to: payload.to,
          reason: 'bulk-apply',
          recipient: {
            email: payload.to,
            name: payload.recipient?.name,
            company: payload.recipient?.company,
            message: payload.recipient?.message,
          },
        });
      } else {
        await this.exportEmailQueueService.enqueue({
          exportId: payload.exportId,
          userId: request.userId,
          to: payload.to,
          reason: 'free-tier-export',
          recipient: payload.recipient,
        });
      }

      await this.systemLogService.log({
        level: 'info',
        action: SystemActions.EXPORT_EMAIL_RETRY_ENQUEUED,
        userId: request.userId,
        metadata: {
          failedJobId: request.failedJobId,
          exportId: payload.exportId,
          to: payload.to,
          reason: payload.reason,
        },
      });

      await this.auditLogService.log({
        action: AuditActions.EXPORT_EMAIL_RETRY_ENQUEUED,
        actorUserId: request.userId,
        ...buildAuditEntity('resumeExport', payload.exportId),
        metadata: {
          failedJobId: request.failedJobId,
          to: payload.to,
          reason: payload.reason,
        },
      });

      return Result.ok({
        failedJobId: request.failedJobId,
        exportId: payload.exportId,
        to: payload.to,
        reason: payload.reason,
      });
    } catch (error) {
      await this.systemLogService.log({
        level: 'error',
        action: SystemActions.EXPORT_EMAIL_RETRY_FAILED,
        userId: request.userId,
        metadata: { failedJobId: request.failedJobId },
        message: error instanceof Error ? error.message : 'Unknown error',
      });

      if (error instanceof AppError) {
        return Result.fail(error);
      }

      return Result.fail(new UnexpectedError(error));
    }
  }
}
