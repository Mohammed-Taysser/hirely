import { ReplayFailedBillingWebhookEventUseCase } from '@dist/modules/billing/application/use-cases/replay-failed-billing-webhook-event/replay-failed-billing-webhook-event.use-case';
import {
  NotFoundError,
  ValidationError,
} from '@dist/modules/shared/application/app-error';

import { failureResult, successResult } from '../../helpers/test-fixtures';

describe('ReplayFailedBillingWebhookEventUseCase', () => {
  const buildDeps = () => ({
    billingWebhookEventRepository: {
      begin: jest.fn(),
      markProcessed: jest.fn(),
      markIgnored: jest.fn(),
      markFailed: jest.fn(),
      getFailedByUser: jest.fn(),
      findFailedByIdForUser: jest.fn().mockResolvedValue({
        id: 'bwe-1',
        provider: 'mock',
        eventId: 'evt_1',
        eventType: 'subscription.renewed',
        status: 'FAILED',
        appliedAction: null,
        error: 'timeout',
        userId: 'user-1',
        signature: 'sig-1',
        payload: {
          userId: 'user-1',
          planCode: 'PRO',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    },
    processBillingWebhookUseCase: {
      execute: jest
        .fn()
        .mockResolvedValue(successResult({ eventId: 'evt_1', applied: 'planChanged', replayed: false })),
    },
    systemLogService: {
      log: jest.fn(),
    },
    auditLogService: {
      log: jest.fn(),
    },
  });

  it('replays failed webhook event successfully', async () => {
    const d = buildDeps();
    const useCase = new ReplayFailedBillingWebhookEventUseCase(
      d.billingWebhookEventRepository,
      d.processBillingWebhookUseCase,
      d.systemLogService,
      d.auditLogService
    );

    const result = await useCase.execute({ userId: 'user-1', webhookEventId: 'bwe-1' });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual({
      webhookEventId: 'bwe-1',
      eventId: 'evt_1',
      applied: 'planChanged',
      replayed: false,
    });
    expect(d.processBillingWebhookUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ eventId: 'evt_1', provider: 'mock', userId: 'user-1' })
    );
  });

  it('returns not found when failed event is missing', async () => {
    const d = buildDeps();
    d.billingWebhookEventRepository.findFailedByIdForUser.mockResolvedValue(null);
    const useCase = new ReplayFailedBillingWebhookEventUseCase(
      d.billingWebhookEventRepository,
      d.processBillingWebhookUseCase,
      d.systemLogService,
      d.auditLogService
    );

    const result = await useCase.execute({ userId: 'user-1', webhookEventId: 'bwe-1' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
  });

  it('returns validation error on unsupported provider in payload', async () => {
    const d = buildDeps();
    d.billingWebhookEventRepository.findFailedByIdForUser.mockResolvedValue({
      id: 'bwe-1',
      provider: 'unknown',
      eventId: 'evt_1',
      eventType: 'subscription.renewed',
      status: 'FAILED',
      appliedAction: null,
      error: 'timeout',
      userId: 'user-1',
      signature: 'sig-1',
      payload: { userId: 'user-1', planCode: 'PRO' },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const useCase = new ReplayFailedBillingWebhookEventUseCase(
      d.billingWebhookEventRepository,
      d.processBillingWebhookUseCase,
      d.systemLogService,
      d.auditLogService
    );

    const result = await useCase.execute({ userId: 'user-1', webhookEventId: 'bwe-1' });
    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ValidationError);
  });

  it('returns failure from process webhook use case', async () => {
    const d = buildDeps();
    d.processBillingWebhookUseCase.execute.mockResolvedValue(
      failureResult(new ValidationError('invalid payload'))
    );

    const useCase = new ReplayFailedBillingWebhookEventUseCase(
      d.billingWebhookEventRepository,
      d.processBillingWebhookUseCase,
      d.systemLogService,
      d.auditLogService
    );

    const result = await useCase.execute({ userId: 'user-1', webhookEventId: 'bwe-1' });
    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ValidationError);
  });
});
