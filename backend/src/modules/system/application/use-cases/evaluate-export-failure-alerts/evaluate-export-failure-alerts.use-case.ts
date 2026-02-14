import {
  EvaluateExportFailureAlertsRequestDto,
  EvaluateExportFailureAlertsResponseDto,
  ExportFailureAlertChannelResult,
} from './evaluate-export-failure-alerts.dto';

import CONFIG from '@/apps/config';
import { UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { ISystemLogQueryRepository } from '@/modules/system/application/repositories/system-log.query.repository.interface';
import { ISystemLogService } from '@/modules/system/application/services/system-log.service.interface';
import { SystemActions } from '@/modules/system/application/system.actions';

type EvaluateExportFailureAlertsResponse = Result<
  EvaluateExportFailureAlertsResponseDto,
  UnexpectedError
>;

type AlertConfig = Pick<
  typeof CONFIG,
  | 'EXPORT_ALERT_WINDOW_MINUTES'
  | 'EXPORT_ALERT_MIN_EVENTS'
  | 'EXPORT_ALERT_FAILURE_RATIO'
  | 'EXPORT_ALERT_COOLDOWN_SECONDS'
>;

type EvaluateChannelInput = {
  now: Date;
  successCount: number;
  failureCount: number;
  alertAction: string;
  channel: 'pdf' | 'email';
};

export class EvaluateExportFailureAlertsUseCase implements UseCase<
  EvaluateExportFailureAlertsRequestDto,
  EvaluateExportFailureAlertsResponse
> {
  constructor(
    private readonly systemLogQueryRepository: ISystemLogQueryRepository,
    private readonly systemLogService: ISystemLogService,
    private readonly config: AlertConfig = CONFIG
  ) {}

  async execute(
    request: EvaluateExportFailureAlertsRequestDto
  ): Promise<EvaluateExportFailureAlertsResponse> {
    try {
      const now = request.now ?? new Date();
      const windowStart = new Date(
        now.getTime() - this.config.EXPORT_ALERT_WINDOW_MINUTES * 60 * 1000
      );

      const actionCounts = await this.systemLogQueryRepository.getActionCounts(
        [
          SystemActions.EXPORT_PDF_PROCESSED,
          SystemActions.EXPORT_PDF_FAILED,
          SystemActions.EXPORT_EMAIL_SENT,
          SystemActions.EXPORT_EMAIL_FAILED,
        ],
        windowStart
      );

      const pdf = await this.evaluateChannel({
        now,
        successCount: actionCounts[SystemActions.EXPORT_PDF_PROCESSED] ?? 0,
        failureCount: actionCounts[SystemActions.EXPORT_PDF_FAILED] ?? 0,
        alertAction: SystemActions.EXPORT_PDF_FAILURE_ALERT_TRIGGERED,
        channel: 'pdf',
      });

      const email = await this.evaluateChannel({
        now,
        successCount: actionCounts[SystemActions.EXPORT_EMAIL_SENT] ?? 0,
        failureCount: actionCounts[SystemActions.EXPORT_EMAIL_FAILED] ?? 0,
        alertAction: SystemActions.EXPORT_EMAIL_FAILURE_ALERT_TRIGGERED,
        channel: 'email',
      });

      return Result.ok({
        windowMinutes: this.config.EXPORT_ALERT_WINDOW_MINUTES,
        minEvents: this.config.EXPORT_ALERT_MIN_EVENTS,
        thresholdRatio: this.config.EXPORT_ALERT_FAILURE_RATIO,
        cooldownSeconds: this.config.EXPORT_ALERT_COOLDOWN_SECONDS,
        pdf,
        email,
      });
    } catch (error) {
      return Result.fail(new UnexpectedError(error));
    }
  }

  private async evaluateChannel(
    input: EvaluateChannelInput
  ): Promise<ExportFailureAlertChannelResult> {
    const total = input.successCount + input.failureCount;
    const failureRatio = total > 0 ? input.failureCount / total : 0;
    const thresholdExceeded =
      total >= this.config.EXPORT_ALERT_MIN_EVENTS &&
      failureRatio >= this.config.EXPORT_ALERT_FAILURE_RATIO;

    if (!thresholdExceeded) {
      return {
        total,
        failed: input.failureCount,
        failureRatio,
        thresholdExceeded: false,
        triggered: false,
        suppressedByCooldown: false,
      };
    }

    const cooldownStart = new Date(
      input.now.getTime() - this.config.EXPORT_ALERT_COOLDOWN_SECONDS * 1000
    );
    const suppressedByCooldown = await this.systemLogQueryRepository.hasActionSince(
      input.alertAction,
      cooldownStart
    );

    if (!suppressedByCooldown) {
      await this.systemLogService.log({
        level: 'warn',
        action: input.alertAction,
        metadata: {
          channel: input.channel,
          total,
          failed: input.failureCount,
          failureRatio,
          thresholdRatio: this.config.EXPORT_ALERT_FAILURE_RATIO,
          minEvents: this.config.EXPORT_ALERT_MIN_EVENTS,
          windowMinutes: this.config.EXPORT_ALERT_WINDOW_MINUTES,
          cooldownSeconds: this.config.EXPORT_ALERT_COOLDOWN_SECONDS,
        },
      });
    }

    return {
      total,
      failed: input.failureCount,
      failureRatio,
      thresholdExceeded: true,
      triggered: !suppressedByCooldown,
      suppressedByCooldown,
    };
  }
}
