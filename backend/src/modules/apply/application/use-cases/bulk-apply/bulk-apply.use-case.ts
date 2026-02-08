import { BulkApplyRequestDto, BulkApplyResponseDto } from './bulk-apply.dto';

import {
  AppError,
  NotFoundError,
  TooManyRequestsError,
  UnexpectedError,
} from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { IApplyService } from '@/modules/apply/application/services/apply.service.interface';
import { IExportService } from '@/modules/export/application/services/export.service.interface';
import { IExportQueueService } from '@/modules/export/application/services/export-queue.service.interface';
import { IResumeSnapshotRepository } from '@/modules/resume/application/repositories/resume-snapshot.repository.interface';
import { IUserQueryRepository } from '@/modules/user/application/repositories/user.query.repository.interface';
import { IRateLimiter } from '@/modules/shared/application/services/rate-limiter.service.interface';
import { IBulkApplyEmailQueueService } from '@/modules/apply/application/services/bulk-apply-email-queue.service.interface';

type BulkApplyResponse = Result<BulkApplyResponseDto, AppError>;

export class BulkApplyUseCase implements UseCase<BulkApplyRequestDto, BulkApplyResponse> {
  constructor(
    private readonly applyService: IApplyService,
    private readonly exportService: IExportService,
    private readonly exportQueueService: IExportQueueService,
    private readonly resumeSnapshotRepository: IResumeSnapshotRepository,
    private readonly userQueryRepository: IUserQueryRepository,
    private readonly rateLimiter: IRateLimiter,
    private readonly emailQueueService: IBulkApplyEmailQueueService,
    private readonly rateLimitConfig: { max: number; windowSeconds: number }
  ) {}

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

      this.applyService.ensureBulkApplyAllowed(user.plan.code);

      await this.exportService.enforceExportLimit(request.user.id, user.planId);

      const batch = await this.applyService.createBatch(request.user.id, request.input);

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

      return Result.ok({
        batchId: batch.batchId,
        exportId: exportRecord.id,
        recipientCount: request.input.recipients.length,
      });
    } catch (err) {
      if (err instanceof AppError) {
        return Result.fail(err);
      }
      return Result.fail(new UnexpectedError(err));
    }
  }
}
