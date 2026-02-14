import { randomUUID } from 'crypto';

import { BulkApplyRequestDto, BulkApplyResponseDto } from './bulk-apply.dto';

import { AuditActions } from '@/modules/audit/application/audit.actions';
import { buildAuditEntity } from '@/modules/audit/application/audit.entity';
import { IAuditLogService } from '@/modules/audit/application/services/audit-log.service.interface';
import {
  hasReachedDailyBulkApplyLimit,
  requirePlanUsageLimits,
} from '@/modules/plan/application/policies/plan-limit.policy';
import { IPlanLimitQueryRepository } from '@/modules/plan/application/repositories/plan-limit.query.repository.interface';
import { IResumeSnapshotRepository } from '@/modules/resume/application/repositories/resume-snapshot.repository.interface';
import { IBulkApplyEmailQueueService } from '@/modules/resume/application/services/bulk-apply-email-queue.service.interface';
import { IExportQueueService } from '@/modules/resume/application/services/export-queue.service.interface';
import { IExportService } from '@/modules/resume/application/services/export.service.interface';
import {
  AppError,
  ForbiddenError,
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
import { IUserQueryRepository } from '@/modules/user/application/repositories/user.query.repository.interface';

type BulkApplyResponse = Result<BulkApplyResponseDto, AppError>;

export class BulkApplyUseCase implements UseCase<BulkApplyRequestDto, BulkApplyResponse> {
  constructor(
    private readonly exportService: IExportService,
    private readonly exportQueueService: IExportQueueService,
    private readonly resumeSnapshotRepository: IResumeSnapshotRepository,
    private readonly planLimitQueryRepository: IPlanLimitQueryRepository,
    private readonly systemLogQueryRepository: ISystemLogQueryRepository,
    private readonly userQueryRepository: IUserQueryRepository,
    private readonly rateLimiter: IRateLimiter,
    private readonly emailQueueService: IBulkApplyEmailQueueService,
    private readonly rateLimitConfig: { max: number; windowSeconds: number },
    private readonly systemLogService: ISystemLogService,
    private readonly auditLogService: IAuditLogService
  ) {}

  private ensureBulkApplyAllowed(planCode: string) {
    if (!planCode) {
      throw new ValidationError('Invalid plan');
    }
  }

  private async createBatch() {
    return { batchId: randomUUID() };
  }

  private getUtcDayRange(now = new Date()) {
    const start = new Date(now);
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setUTCHours(23, 59, 59, 999);

    return { start, end };
  }

  public async execute(request: BulkApplyRequestDto): Promise<BulkApplyResponse> {
    try {
      const allowed = await this.rateLimiter.consume({
        key: `rate:bulk-apply:${request.user.id}`,
        max: this.rateLimitConfig.max,
        windowSeconds: this.rateLimitConfig.windowSeconds,
      });

      if (!allowed) {
        return Result.fail(new TooManyRequestsError('Bulk apply rate limit exceeded'));
      }

      const user = await this.userQueryRepository.findById(request.user.id);
      if (!user?.planId || !user.plan?.code) {
        return Result.fail(new NotFoundError('User plan not found'));
      }

      this.ensureBulkApplyAllowed(user.plan.code);

      const planLimit = await this.planLimitQueryRepository.findByPlanId(user.planId);
      const usageLimits = requirePlanUsageLimits(planLimit);
      const { start, end } = this.getUtcDayRange();
      const dailyBulkAppliesUsed = await this.systemLogQueryRepository.countByUserAndActionInRange(
        request.user.id,
        SystemActions.BULK_APPLY_ENQUEUED,
        start,
        end
      );
      if (hasReachedDailyBulkApplyLimit(dailyBulkAppliesUsed, usageLimits.dailyBulkApplies)) {
        return Result.fail(new ForbiddenError('Daily bulk apply limit reached for your plan'));
      }

      await this.exportService.enforceExportLimit(request.user.id, user.planId);

      const batch = await this.createBatch();

      const snapshot = await this.resumeSnapshotRepository.createSnapshot(
        request.user.id,
        request.input.resumeId
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

      await Promise.all(
        request.input.recipients.map((recipient) =>
          this.emailQueueService.enqueue({
            exportId: exportRecord.id,
            userId: request.user.id,
            to: recipient.email,
            recipient,
            reason: 'bulk-apply',
          })
        )
      );

      await this.systemLogService.log({
        level: 'info',
        action: SystemActions.BULK_APPLY_ENQUEUED,
        userId: request.user.id,
        metadata: {
          batchId: batch.batchId,
          exportId: exportRecord.id,
          recipientCount: request.input.recipients.length,
        },
      });

      await this.auditLogService.log({
        action: AuditActions.BULK_APPLY_ENQUEUED,
        actorUserId: request.user.id,
        ...buildAuditEntity('user', request.user.id),
        metadata: {
          batchId: batch.batchId,
          exportId: exportRecord.id,
          recipientCount: request.input.recipients.length,
        },
      });

      return Result.ok({
        batchId: batch.batchId,
        exportId: exportRecord.id,
        recipientCount: request.input.recipients.length,
      });
    } catch (err) {
      await this.systemLogService.log({
        level: 'error',
        action: SystemActions.BULK_APPLY_FAILED,
        userId: request.user.id,
        message: err instanceof Error ? err.message : 'Unknown error',
      });
      if (err instanceof AppError) {
        return Result.fail(err);
      }
      return Result.fail(new UnexpectedError(err));
    }
  }
}
