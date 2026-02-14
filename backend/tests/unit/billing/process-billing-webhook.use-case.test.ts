import { ProcessBillingWebhookUseCase } from '@dist/modules/billing/application/use-cases/process-billing-webhook/process-billing-webhook.use-case';
import {
  NotFoundError,
  ValidationError,
} from '@dist/modules/shared/application/app-error';
import { SystemActions } from '@dist/modules/system/application/system.actions';

describe('ProcessBillingWebhookUseCase', () => {
  const buildDeps = () => {
    return {
      userQueryRepository: {
        findById: jest.fn().mockResolvedValue({
          id: 'user-1',
          planId: 'plan-current',
          plan: { id: 'plan-current', code: 'FREE', name: 'Free' },
        }),
        findByEmail: jest.fn(),
        findAuthByEmail: jest.fn(),
        getPaginatedUsers: jest.fn(),
        getBasicUsers: jest.fn(),
      },
      userPlanCommandRepository: {
        changePlanNow: jest.fn(),
        schedulePlanChange: jest.fn(),
      },
      billingWebhookEventRepository: {
        begin: jest.fn().mockResolvedValue({
          event: {
            id: 'bwe-1',
            provider: 'mock',
            eventId: 'evt_1',
            eventType: 'subscription.renewed',
            status: 'PROCESSING',
            appliedAction: null,
            error: null,
            userId: 'user-1',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          isReplay: false,
          canProcess: true,
        }),
        markProcessed: jest.fn(),
        markIgnored: jest.fn(),
        markFailed: jest.fn(),
      },
      planQueryRepository: {
        findByCode: jest.fn().mockResolvedValue({ id: 'plan-pro', code: 'PRO' }),
        findById: jest.fn(),
        getPaginatedPlans: jest.fn(),
      },
      systemLogService: {
        log: jest.fn(),
      },
      auditLogService: {
        log: jest.fn(),
      },
    };
  };

  it('applies immediate plan change on subscription renewal', async () => {
    const d = buildDeps();
    const useCase = new ProcessBillingWebhookUseCase(
      d.userQueryRepository,
      d.userPlanCommandRepository,
      d.billingWebhookEventRepository,
      d.planQueryRepository,
      d.systemLogService,
      d.auditLogService
    );

    const result = await useCase.execute({
      eventId: 'evt_renew_0001',
      provider: 'mock',
      type: 'subscription.renewed',
      userId: 'user-1',
      signature: 'sig-1',
      planCode: 'PRO',
      payload: { sample: true },
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().replayed).toBe(false);
    expect(d.userPlanCommandRepository.changePlanNow).toHaveBeenCalledWith('user-1', 'plan-pro');
    expect(d.userPlanCommandRepository.schedulePlanChange).not.toHaveBeenCalled();
    expect(d.billingWebhookEventRepository.markProcessed).toHaveBeenCalledWith(
      'bwe-1',
      'planChanged'
    );
    expect(d.systemLogService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: SystemActions.BILLING_WEBHOOK_RECEIVED,
      })
    );
  });

  it('schedules fallback plan on cancellation when effectiveAt is in the future', async () => {
    const d = buildDeps();
    const useCase = new ProcessBillingWebhookUseCase(
      d.userQueryRepository,
      d.userPlanCommandRepository,
      d.billingWebhookEventRepository,
      d.planQueryRepository,
      d.systemLogService,
      d.auditLogService
    );
    const effectiveAt = new Date(Date.now() + 3600_000);

    const result = await useCase.execute({
      eventId: 'evt_cancel_0001',
      provider: 'mock',
      type: 'subscription.canceled',
      userId: 'user-1',
      signature: 'sig-1',
      fallbackPlanCode: 'PRO',
      effectiveAt: effectiveAt.toISOString(),
      payload: { sample: true },
    });

    expect(result.isSuccess).toBe(true);
    expect(d.userPlanCommandRepository.schedulePlanChange).toHaveBeenCalledWith(
      'user-1',
      'plan-pro',
      effectiveAt
    );
    expect(d.userPlanCommandRepository.changePlanNow).not.toHaveBeenCalled();
  });

  it('returns not found when user does not exist', async () => {
    const d = buildDeps();
    d.userQueryRepository.findById.mockResolvedValue(null);
    const useCase = new ProcessBillingWebhookUseCase(
      d.userQueryRepository,
      d.userPlanCommandRepository,
      d.billingWebhookEventRepository,
      d.planQueryRepository,
      d.systemLogService,
      d.auditLogService
    );

    const result = await useCase.execute({
      eventId: 'evt_missing_user',
      provider: 'mock',
      type: 'subscription.past_due',
      userId: 'user-1',
      signature: 'sig-1',
      payload: { sample: true },
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
    expect(d.billingWebhookEventRepository.markFailed).toHaveBeenCalledWith('bwe-1', 'User not found');
  });

  it('returns validation error for unknown plan code', async () => {
    const d = buildDeps();
    d.planQueryRepository.findByCode.mockResolvedValue(null);
    const useCase = new ProcessBillingWebhookUseCase(
      d.userQueryRepository,
      d.userPlanCommandRepository,
      d.billingWebhookEventRepository,
      d.planQueryRepository,
      d.systemLogService,
      d.auditLogService
    );

    const result = await useCase.execute({
      eventId: 'evt_unknown_plan',
      provider: 'mock',
      type: 'subscription.renewed',
      userId: 'user-1',
      signature: 'sig-1',
      planCode: 'UNKNOWN',
      payload: { sample: true },
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ValidationError);
    expect(d.systemLogService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: SystemActions.BILLING_WEBHOOK_FAILED,
      })
    );
  });

  it('returns replay response when event is already processed', async () => {
    const d = buildDeps();
    d.billingWebhookEventRepository.begin.mockResolvedValueOnce({
      event: {
        id: 'bwe-1',
        provider: 'mock',
        eventId: 'evt_replayed',
        eventType: 'subscription.renewed',
        status: 'PROCESSED',
        appliedAction: 'planChanged',
        error: null,
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      isReplay: true,
      canProcess: false,
    });

    const useCase = new ProcessBillingWebhookUseCase(
      d.userQueryRepository,
      d.userPlanCommandRepository,
      d.billingWebhookEventRepository,
      d.planQueryRepository,
      d.systemLogService,
      d.auditLogService
    );

    const result = await useCase.execute({
      eventId: 'evt_replayed',
      provider: 'mock',
      type: 'subscription.renewed',
      userId: 'user-1',
      signature: 'sig-1',
      planCode: 'PRO',
      payload: { sample: true },
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual({
      eventId: 'evt_replayed',
      applied: 'planChanged',
      replayed: true,
    });
    expect(d.userPlanCommandRepository.changePlanNow).not.toHaveBeenCalled();
  });
});
