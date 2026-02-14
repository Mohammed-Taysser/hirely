import {
  ReplayFailedBillingWebhookEventRequestDto,
  ReplayFailedBillingWebhookEventResponseDto,
} from './replay-failed-billing-webhook-event.dto';

import { AuditActions } from '@/modules/audit/application/audit.actions';
import { buildAuditEntity } from '@/modules/audit/application/audit.entity';
import { IAuditLogService } from '@/modules/audit/application/services/audit-log.service.interface';
import { IBillingWebhookEventRepository } from '@/modules/billing/application/repositories/billing-webhook-event.repository.interface';
import { ProcessBillingWebhookRequestDto } from '@/modules/billing/application/use-cases/process-billing-webhook/process-billing-webhook.dto';
import {
  AppError,
  NotFoundError,
  UnexpectedError,
  ValidationError,
} from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { ISystemLogService } from '@/modules/system/application/services/system-log.service.interface';
import { SystemActions } from '@/modules/system/application/system.actions';

type ProcessWebhookExecutor = {
  execute(
    request: ProcessBillingWebhookRequestDto
  ): Promise<
    Result<
      { eventId: string; applied: 'none' | 'planChanged' | 'planScheduled'; replayed: boolean },
      AppError
    >
  >;
};

type ReplayFailedBillingWebhookEventResponse = Result<
  ReplayFailedBillingWebhookEventResponseDto,
  AppError
>;

const asStringOrUndefined = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value : undefined;

const asObjectOrUndefined = (value: unknown): Record<string, unknown> | undefined =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

export class ReplayFailedBillingWebhookEventUseCase implements UseCase<
  ReplayFailedBillingWebhookEventRequestDto,
  ReplayFailedBillingWebhookEventResponse
> {
  constructor(
    private readonly billingWebhookEventRepository: IBillingWebhookEventRepository,
    private readonly processBillingWebhookUseCase: ProcessWebhookExecutor,
    private readonly systemLogService: ISystemLogService,
    private readonly auditLogService: IAuditLogService
  ) {}

  private toReplayRequest(event: {
    provider: string;
    eventId: string;
    eventType: string;
    userId: string | null;
    signature: string | null;
    payload: Record<string, unknown>;
  }): Result<ProcessBillingWebhookRequestDto, ValidationError> {
    const userId = event.userId ?? asStringOrUndefined(event.payload.userId);
    if (!userId) {
      return Result.fail(new ValidationError('Cannot replay webhook without userId'));
    }

    const provider = event.provider;
    const type = event.eventType;
    if (provider !== 'stripe' && provider !== 'paddle' && provider !== 'mock') {
      return Result.fail(new ValidationError('Unsupported billing provider in webhook event'));
    }

    if (
      type !== 'subscription.renewed' &&
      type !== 'subscription.canceled' &&
      type !== 'subscription.past_due'
    ) {
      return Result.fail(new ValidationError('Unsupported billing event type'));
    }

    return Result.ok({
      eventId: event.eventId,
      provider,
      type,
      userId,
      signature: event.signature,
      subscriptionId: asStringOrUndefined(event.payload.subscriptionId),
      planCode: asStringOrUndefined(event.payload.planCode),
      fallbackPlanCode: asStringOrUndefined(event.payload.fallbackPlanCode),
      effectiveAt: asStringOrUndefined(event.payload.effectiveAt),
      metadata: asObjectOrUndefined(event.payload.metadata),
      payload: event.payload,
    });
  }

  async execute(
    request: ReplayFailedBillingWebhookEventRequestDto
  ): Promise<ReplayFailedBillingWebhookEventResponse> {
    try {
      const failedEvent = await this.billingWebhookEventRepository.findFailedByIdForUser(
        request.userId,
        request.webhookEventId
      );
      if (!failedEvent) {
        return Result.fail(new NotFoundError('Failed billing webhook event not found'));
      }

      const replayRequestResult = this.toReplayRequest(failedEvent);
      if (replayRequestResult.isFailure) {
        return Result.fail(
          replayRequestResult.error ?? new ValidationError('Invalid failed webhook payload')
        );
      }

      const replayResult = await this.processBillingWebhookUseCase.execute(
        replayRequestResult.getValue()
      );

      if (replayResult.isFailure) {
        return Result.fail(replayResult.error ?? new UnexpectedError('Replay failed'));
      }

      const payload = replayResult.getValue();

      await this.systemLogService.log({
        level: 'info',
        action: SystemActions.BILLING_WEBHOOK_REPLAYED,
        userId: request.userId,
        metadata: {
          webhookEventId: request.webhookEventId,
          eventId: payload.eventId,
          applied: payload.applied,
          replayed: payload.replayed,
        },
      });

      await this.auditLogService.log({
        action: AuditActions.BILLING_WEBHOOK_REPLAYED,
        actorUserId: request.userId,
        ...buildAuditEntity('user', request.userId),
        metadata: {
          webhookEventId: request.webhookEventId,
          eventId: payload.eventId,
          applied: payload.applied,
          replayed: payload.replayed,
        },
      });

      return Result.ok({
        webhookEventId: request.webhookEventId,
        eventId: payload.eventId,
        applied: payload.applied,
        replayed: payload.replayed,
      });
    } catch (error) {
      await this.systemLogService.log({
        level: 'error',
        action: SystemActions.BILLING_WEBHOOK_REPLAY_FAILED,
        userId: request.userId,
        metadata: {
          webhookEventId: request.webhookEventId,
        },
        message: error instanceof Error ? error.message : 'Unknown error',
      });

      if (error instanceof AppError) {
        return Result.fail(error);
      }

      return Result.fail(new UnexpectedError(error));
    }
  }
}
