import { GetFailedBillingWebhookEventsUseCase } from '@dist/modules/billing/application/use-cases/get-failed-billing-webhook-events/get-failed-billing-webhook-events.use-case';
import { UnexpectedError } from '@dist/modules/shared/application/app-error';

describe('GetFailedBillingWebhookEventsUseCase', () => {
  const buildDeps = () => ({
    billingWebhookEventRepository: {
      begin: jest.fn(),
      markProcessed: jest.fn(),
      markIgnored: jest.fn(),
      markFailed: jest.fn(),
      findFailedByIdForUser: jest.fn(),
      getFailedByUser: jest.fn().mockResolvedValue({
        events: [
          {
            id: 'bwe-1',
            provider: 'mock',
            eventId: 'evt_1',
            eventType: 'subscription.renewed',
            status: 'FAILED',
            appliedAction: null,
            error: 'timeout',
            userId: 'user-1',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 1,
      }),
    },
  });

  it('returns paginated failed events', async () => {
    const d = buildDeps();
    const useCase = new GetFailedBillingWebhookEventsUseCase(d.billingWebhookEventRepository);

    const result = await useCase.execute({
      userId: 'user-1',
      page: 1,
      limit: 10,
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().total).toBe(1);
    expect(result.getValue().events[0]).toEqual(
      expect.objectContaining({
        id: 'bwe-1',
        status: 'FAILED',
      })
    );
  });

  it('wraps unknown errors', async () => {
    const d = buildDeps();
    d.billingWebhookEventRepository.getFailedByUser.mockRejectedValue(new Error('boom'));
    const useCase = new GetFailedBillingWebhookEventsUseCase(d.billingWebhookEventRepository);

    const result = await useCase.execute({
      userId: 'user-1',
      page: 1,
      limit: 10,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });
});
