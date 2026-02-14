import {
  ProcessBillingWebhookRequestDto,
  ProcessBillingWebhookResponseDto,
} from './process-billing-webhook.dto';

import { AuditActions } from '@/modules/audit/application/audit.actions';
import { buildAuditEntity } from '@/modules/audit/application/audit.entity';
import { IAuditLogService } from '@/modules/audit/application/services/audit-log.service.interface';
import { IBillingWebhookEventRepository } from '@/modules/billing/application/repositories/billing-webhook-event.repository.interface';
import { IPlanQueryRepository } from '@/modules/plan/application/repositories/plan.query.repository.interface';
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
import { IUserPlanCommandRepository } from '@/modules/user/application/repositories/user-plan-command.repository.interface';
import { IUserQueryRepository } from '@/modules/user/application/repositories/user.query.repository.interface';

type ProcessBillingWebhookResponse = Result<ProcessBillingWebhookResponseDto, AppError>;

type AppliedAction = ProcessBillingWebhookResponseDto['applied'];
type BeginWebhookResult = Awaited<ReturnType<IBillingWebhookEventRepository['begin']>>;

export class ProcessBillingWebhookUseCase implements UseCase<
  ProcessBillingWebhookRequestDto,
  ProcessBillingWebhookResponse
> {
  constructor(
    private readonly userQueryRepository: IUserQueryRepository,
    private readonly userPlanCommandRepository: IUserPlanCommandRepository,
    private readonly billingWebhookEventRepository: IBillingWebhookEventRepository,
    private readonly planQueryRepository: IPlanQueryRepository,
    private readonly systemLogService: ISystemLogService,
    private readonly auditLogService: IAuditLogService
  ) {}

  private toFutureDateOrNull(value?: string): Date | null {
    if (!value) {
      return null;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new ValidationError('effectiveAt must be a valid ISO date');
    }

    return parsed.getTime() > Date.now() ? parsed : null;
  }

  private async getPlanIdByCode(code: string): Promise<string> {
    const plan = await this.planQueryRepository.findByCode(code.trim());
    if (!plan) {
      throw new ValidationError(`Plan not found for code "${code}"`);
    }

    return plan.id;
  }

  private async applyPlanChangeByCode(
    userId: string,
    planCode: string,
    effectiveAt?: string
  ): Promise<AppliedAction> {
    const planId = await this.getPlanIdByCode(planCode);
    const scheduleAt = this.toFutureDateOrNull(effectiveAt);

    if (scheduleAt) {
      await this.userPlanCommandRepository.schedulePlanChange(userId, planId, scheduleAt);
      return 'planScheduled';
    }

    await this.userPlanCommandRepository.changePlanNow(userId, planId);
    return 'planChanged';
  }

  private async beginWebhook(
    request: ProcessBillingWebhookRequestDto
  ): Promise<BeginWebhookResult> {
    return this.billingWebhookEventRepository.begin({
      provider: request.provider,
      eventId: request.eventId,
      eventType: request.type,
      signature: request.signature,
      payload: request.payload,
      userId: request.userId ?? null,
    });
  }

  private toReplayResponse(
    request: ProcessBillingWebhookRequestDto,
    beginResult: BeginWebhookResult
  ): ProcessBillingWebhookResponse {
    return Result.ok({
      eventId: request.eventId,
      applied: beginResult.event.appliedAction ?? 'none',
      replayed: true,
    });
  }

  private async resolveAppliedAction(
    request: ProcessBillingWebhookRequestDto
  ): Promise<AppliedAction> {
    if (request.type === 'subscription.renewed' && request.planCode) {
      return this.applyPlanChangeByCode(request.userId, request.planCode);
    }

    if (request.type === 'subscription.canceled' && request.fallbackPlanCode) {
      return this.applyPlanChangeByCode(
        request.userId,
        request.fallbackPlanCode,
        request.effectiveAt
      );
    }

    return 'none';
  }

  private async logSuccess(
    request: ProcessBillingWebhookRequestDto,
    applied: AppliedAction
  ): Promise<void> {
    await this.systemLogService.log({
      level: 'info',
      action: SystemActions.BILLING_WEBHOOK_RECEIVED,
      userId: request.userId,
      metadata: {
        eventId: request.eventId,
        provider: request.provider,
        eventType: request.type,
        subscriptionId: request.subscriptionId ?? null,
        planCode: request.planCode ?? null,
        fallbackPlanCode: request.fallbackPlanCode ?? null,
        effectiveAt: request.effectiveAt ?? null,
        applied,
        metadata: request.metadata ?? null,
      },
    });

    await this.auditLogService.log({
      action: AuditActions.BILLING_WEBHOOK_RECEIVED,
      actorUserId: request.userId,
      ...buildAuditEntity('user', request.userId),
      metadata: {
        eventId: request.eventId,
        provider: request.provider,
        eventType: request.type,
        subscriptionId: request.subscriptionId ?? null,
        applied,
      },
    });
  }

  private async handleFailure(
    request: ProcessBillingWebhookRequestDto,
    eventRowId: string | null,
    error: unknown
  ): Promise<ProcessBillingWebhookResponse> {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (eventRowId) {
      await this.billingWebhookEventRepository.markFailed(eventRowId, errorMessage);
    }

    await this.systemLogService.log({
      level: 'error',
      action: SystemActions.BILLING_WEBHOOK_FAILED,
      userId: request.userId,
      metadata: {
        eventId: request.eventId,
        provider: request.provider,
        eventType: request.type,
        subscriptionId: request.subscriptionId ?? null,
      },
      message: errorMessage,
    });

    if (error instanceof AppError) {
      return Result.fail(error);
    }

    return Result.fail(new UnexpectedError(error));
  }

  public async execute(
    request: ProcessBillingWebhookRequestDto
  ): Promise<ProcessBillingWebhookResponse> {
    let eventRowId: string | null = null;
    try {
      const beginResult = await this.beginWebhook(request);
      eventRowId = beginResult.event.id;

      if (!beginResult.canProcess) {
        return this.toReplayResponse(request, beginResult);
      }

      const user = await this.userQueryRepository.findById(request.userId);
      if (!user) {
        await this.billingWebhookEventRepository.markFailed(eventRowId, 'User not found');
        return Result.fail(new NotFoundError('User not found'));
      }

      const applied = await this.resolveAppliedAction(request);
      await this.logSuccess(request, applied);

      await this.billingWebhookEventRepository.markProcessed(eventRowId, applied);

      return Result.ok({
        eventId: request.eventId,
        applied,
        replayed: beginResult.isReplay,
      });
    } catch (error) {
      return this.handleFailure(request, eventRowId, error);
    }
  }
}
