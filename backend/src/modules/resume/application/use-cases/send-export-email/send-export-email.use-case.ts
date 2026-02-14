import { SendExportEmailRequestDto } from './send-export-email.dto';

import { IActivityService } from '@/modules/activity/application/services/activity.service.interface';
import { AuditActions } from '@/modules/audit/application/audit.actions';
import { buildAuditEntity } from '@/modules/audit/application/audit.entity';
import { IAuditLogService } from '@/modules/audit/application/services/audit-log.service.interface';
import {
  hasReachedDailyExportEmailLimit,
  requirePlanUsageLimits,
} from '@/modules/plan/application/policies/plan-limit.policy';
import { IPlanLimitQueryRepository } from '@/modules/plan/application/repositories/plan-limit.query.repository.interface';
import { IResumeExportQueryRepository } from '@/modules/resume/application/repositories/resume-export.query.repository.interface';
import { buildExportEmailContent } from '@/modules/resume/application/services/export-email-content';
import { IExportEmailService } from '@/modules/resume/application/services/export-email.service.interface';
import { IExportStorageService } from '@/modules/resume/application/services/export-storage.service.interface';
import {
  AppError,
  ForbiddenError,
  NotFoundError,
  UnexpectedError,
} from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { ISystemLogQueryRepository } from '@/modules/system/application/repositories/system-log.query.repository.interface';
import { SystemActions } from '@/modules/system/application/system.actions';
import { IUserQueryRepository } from '@/modules/user/application/repositories/user.query.repository.interface';

type SendExportEmailResponse = Result<void, AppError>;

export class SendExportEmailUseCase implements UseCase<
  SendExportEmailRequestDto,
  SendExportEmailResponse
> {
  private getUtcDayRange(now = new Date()) {
    const start = new Date(now);
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setUTCHours(23, 59, 59, 999);

    return { start, end };
  }

  constructor(
    private readonly exportEmailService: IExportEmailService,
    private readonly auditLogService: IAuditLogService,
    private readonly planLimitQueryRepository: IPlanLimitQueryRepository,
    private readonly systemLogQueryRepository: ISystemLogQueryRepository,
    private readonly resumeExportQueryRepository: IResumeExportQueryRepository,
    private readonly userQueryRepository: IUserQueryRepository,
    private readonly storageService: IExportStorageService,
    private readonly activityService: IActivityService
  ) {}

  async execute(request: SendExportEmailRequestDto): Promise<SendExportEmailResponse> {
    try {
      const exportRecord = await this.resumeExportQueryRepository.findById(
        request.userId,
        request.exportId
      );
      if (!exportRecord || !exportRecord.url) {
        throw new NotFoundError('Export not ready');
      }

      if (exportRecord.status !== 'READY') {
        throw new NotFoundError('Export not ready');
      }

      const user = await this.userQueryRepository.findById(request.userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }
      if (!user.planId) {
        throw new NotFoundError('User plan not found');
      }

      const planLimit = await this.planLimitQueryRepository.findByPlanId(user.planId);
      const usageLimits = requirePlanUsageLimits(planLimit);
      const { start, end } = this.getUtcDayRange();
      const dailyExportEmailsUsed = await this.systemLogQueryRepository.countByUserAndActionInRange(
        request.userId,
        SystemActions.EXPORT_EMAIL_SENT,
        start,
        end
      );
      if (hasReachedDailyExportEmailLimit(dailyExportEmailsUsed, usageLimits.dailyExportEmails)) {
        throw new ForbiddenError('Daily export email limit reached for your plan');
      }

      const downloadUrl = await this.storageService.getSignedDownloadUrl(exportRecord.url, 60 * 60);
      if (!downloadUrl) {
        throw new NotFoundError('Export not ready');
      }
      const isLocalFile = downloadUrl.startsWith('file://');

      const { subject, body } = buildExportEmailContent({
        senderEmail: user.email,
        recipient: request.recipient,
        reason: request.reason,
        downloadUrl,
        isAttachment: isLocalFile,
      });

      await this.exportEmailService.sendEmail({
        to: request.to,
        subject,
        body,
        downloadUrl,
      });

      await this.activityService.log(request.userId, 'resume.sent.email', {
        exportId: request.exportId,
        to: request.to,
        reason: request.reason,
      });

      await this.auditLogService.log({
        action: AuditActions.EXPORT_EMAIL_SENT,
        actorUserId: request.userId,
        ...buildAuditEntity('resumeExport', request.exportId),
        metadata: { to: request.to, reason: request.reason },
      });

      return Result.ok();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';

      await this.auditLogService.log({
        action: AuditActions.EXPORT_EMAIL_FAILED,
        actorUserId: request.userId,
        ...buildAuditEntity('resumeExport', request.exportId),
        metadata: { to: request.to, reason: request.reason, error: message },
      });

      if (err instanceof AppError) {
        return Result.fail(err);
      }
      return Result.fail(new UnexpectedError(err));
    }
  }
}
