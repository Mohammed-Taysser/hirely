import {
  EnqueueResumeExportRequestDto,
  EnqueueResumeExportResponseDto,
} from './enqueue-resume-export.dto';

import { AuditActions } from '@/modules/audit/application/audit.actions';
import { buildAuditEntity } from '@/modules/audit/application/audit.entity';
import { IAuditLogService } from '@/modules/audit/application/services/audit-log.service.interface';
import { canDirectDownload } from '@/modules/resume/application/policies/export.policy';
import { IResumeExportQueryRepository } from '@/modules/resume/application/repositories/resume-export.query.repository.interface';
import { IResumeSnapshotRepository } from '@/modules/resume/application/repositories/resume-snapshot.repository.interface';
import { IExportQueueService } from '@/modules/resume/application/services/export-queue.service.interface';
import { IExportService } from '@/modules/resume/application/services/export.service.interface';
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
import { IUserQueryRepository } from '@/modules/user/application/repositories/user.query.repository.interface';

type EnqueueResumeExportResponse = Result<EnqueueResumeExportResponseDto, AppError>;

export class EnqueueResumeExportUseCase implements UseCase<
  EnqueueResumeExportRequestDto,
  EnqueueResumeExportResponse
> {
  constructor(
    private readonly exportService: IExportService,
    private readonly exportQueueService: IExportQueueService,
    private readonly resumeExportQueryRepository: IResumeExportQueryRepository,
    private readonly resumeSnapshotRepository: IResumeSnapshotRepository,
    private readonly userQueryRepository: IUserQueryRepository,
    private readonly rateLimiter: IRateLimiter,
    private readonly systemLogService: ISystemLogService,
    private readonly auditLogService: IAuditLogService
  ) {}

  private async getUserPlanOrThrow(userId: string) {
    const user = await this.userQueryRepository.findById(userId);
    if (!user?.planId || !user.plan?.code) {
      throw new NotFoundError('User plan not found');
    }
    return user;
  }

  private async logIdempotentReplay(input: {
    userId: string;
    resumeId: string;
    exportId: string;
    idempotencyKey: string;
    delivery: 'download' | 'email';
  }) {
    await this.systemLogService.log({
      level: 'info',
      action: SystemActions.RESUME_EXPORT_ENQUEUE_IDEMPOTENT_REPLAYED,
      userId: input.userId,
      metadata: {
        exportId: input.exportId,
        resumeId: input.resumeId,
        idempotencyKey: input.idempotencyKey,
        delivery: input.delivery,
      },
    });
  }

  private async resolveReplay(input: {
    userId: string;
    resumeId: string;
    idempotencyKey?: string;
    delivery: 'download' | 'email';
  }): Promise<EnqueueResumeExportResponseDto | null> {
    if (!input.idempotencyKey) {
      return null;
    }

    const existingExport = await this.resumeExportQueryRepository.findByIdempotencyKey(
      input.userId,
      input.idempotencyKey
    );
    if (!existingExport) {
      return null;
    }
    if (existingExport.resumeId !== input.resumeId) {
      throw new ConflictError('Idempotency key already used for another resume export request');
    }

    await this.logIdempotentReplay({
      userId: input.userId,
      resumeId: input.resumeId,
      exportId: existingExport.id,
      idempotencyKey: input.idempotencyKey,
      delivery: input.delivery,
    });
    return { exportId: existingExport.id, delivery: input.delivery };
  }

  private async enqueueNewExport(input: {
    userId: string;
    resumeId: string;
    planId: string;
    delivery: 'download' | 'email';
    idempotencyKey?: string;
  }): Promise<EnqueueResumeExportResponseDto> {
    await this.exportService.enforceExportLimit(input.userId, input.planId);

    const snapshot = await this.resumeSnapshotRepository.createSnapshot(
      input.userId,
      input.resumeId
    );
    if (!snapshot) {
      throw new NotFoundError('Resume not found');
    }

    let exportRecord: { id: string };
    try {
      exportRecord = await this.exportService.createExportRecord(input.userId, snapshot.id, {
        idempotencyKey: input.idempotencyKey,
      });
    } catch (error) {
      if (input.idempotencyKey && error instanceof ConflictError) {
        const replay = await this.resolveReplay(input);
        if (replay) {
          return replay;
        }
      }
      throw error;
    }

    await this.exportQueueService.enqueuePdf({
      exportId: exportRecord.id,
      snapshotId: snapshot.id,
      userId: input.userId,
    });

    await this.systemLogService.log({
      level: 'info',
      action: SystemActions.RESUME_EXPORT_ENQUEUED,
      userId: input.userId,
      metadata: {
        exportId: exportRecord.id,
        resumeId: input.resumeId,
        delivery: input.delivery,
        idempotencyKey: input.idempotencyKey,
      },
    });

    await this.auditLogService.log({
      action: AuditActions.EXPORT_ENQUEUED,
      actorUserId: input.userId,
      ...buildAuditEntity('resumeExport', exportRecord.id),
      metadata: {
        resumeId: input.resumeId,
        snapshotId: snapshot.id,
        delivery: input.delivery,
        idempotencyKey: input.idempotencyKey,
      },
    });

    return {
      exportId: exportRecord.id,
      delivery: input.delivery,
    };
  }

  public async execute(
    request: EnqueueResumeExportRequestDto
  ): Promise<EnqueueResumeExportResponse> {
    try {
      const idempotencyKey = request.idempotencyKey?.trim() || undefined;
      const user = await this.getUserPlanOrThrow(request.user.id);
      const planCode = user.plan?.code;
      if (!planCode) {
        return Result.fail(new NotFoundError('User plan not found'));
      }
      const delivery = canDirectDownload(planCode) ? 'download' : 'email';
      const replay = await this.resolveReplay({
        userId: request.user.id,
        resumeId: request.resumeId,
        idempotencyKey,
        delivery,
      });
      if (replay) {
        return Result.ok(replay);
      }

      const allowed = await this.rateLimiter.consume({
        key: `rate:export:${request.user.id}`,
        max: 50,
        windowSeconds: 120,
      });

      if (!allowed) {
        return Result.fail(new TooManyRequestsError('Export rate limit exceeded'));
      }
      const response = await this.enqueueNewExport({
        userId: request.user.id,
        resumeId: request.resumeId,
        planId: user.planId,
        delivery,
        idempotencyKey,
      });
      return Result.ok(response);
    } catch (err) {
      await this.systemLogService.log({
        level: 'error',
        action: SystemActions.RESUME_EXPORT_ENQUEUE_FAILED,
        userId: request.user.id,
        metadata: { resumeId: request.resumeId, idempotencyKey: request.idempotencyKey },
        message: err instanceof Error ? err.message : 'Unknown error',
      });

      if (err instanceof AppError) {
        return Result.fail(err);
      }
      return Result.fail(new UnexpectedError(err));
    }
  }
}
