import { successResult } from '../../helpers/test-fixtures';
import { runMiddleware } from '../helpers/http-middleware.helper';
import { findRouteLayer } from '../helpers/route-inspector.helper';

const mockProcessBillingWebhookExecute = jest.fn();
const mockVerifyWebhookSignature = jest.fn();
const mockGetFailedBillingWebhookEventsExecute = jest.fn();
const mockReplayFailedBillingWebhookEventExecute = jest.fn();

const setupRouter = async () => {
  jest.resetModules();
  mockProcessBillingWebhookExecute.mockReset();
  mockVerifyWebhookSignature.mockReset();
  mockGetFailedBillingWebhookEventsExecute.mockReset();
  mockReplayFailedBillingWebhookEventExecute.mockReset();

  jest.doMock('@dist/apps/container', () => ({
    billingContainer: {
      processBillingWebhookUseCase: {
        execute: (...args: unknown[]) => mockProcessBillingWebhookExecute(...args),
      },
      getFailedBillingWebhookEventsUseCase: {
        execute: (...args: unknown[]) => mockGetFailedBillingWebhookEventsExecute(...args),
      },
      replayFailedBillingWebhookEventUseCase: {
        execute: (...args: unknown[]) => mockReplayFailedBillingWebhookEventExecute(...args),
      },
      webhookSignatureVerifierService: {
        verify: (...args: unknown[]) => mockVerifyWebhookSignature(...args),
      },
    },
  }));

  const { default: billingRoutes } = await import('@dist/modules/billing/presentation/billing.route');
  const { default: errorHandlerMiddleware } = await import('@dist/middleware/error-handler.middleware');
  const renderErrorResponse = (err: unknown, req: Record<string, unknown>) => {
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    errorHandlerMiddleware(err as never, req as never, response as never, (() => {}) as never);
    return response;
  };

  return { billingRoutes, renderErrorResponse };
};

describe('billing controller http integration', () => {
  it('returns 401 when webhook signature is invalid', async () => {
    const { billingRoutes, renderErrorResponse } = await setupRouter();
    const route = findRouteLayer(billingRoutes, 'post', '/webhooks/events');
    mockVerifyWebhookSignature.mockReturnValue({
      isValid: false,
      signature: 'sig-invalid',
      reason: 'Signature mismatch',
    });

    const req = {
      body: {
        eventId: 'evt_renew_0001',
        provider: 'mock',
        type: 'subscription.renewed',
        userId: 'a4e13979-5ca9-4ec9-a20f-72cb152c2e68',
      },
      rawBody:
        '{"eventId":"evt_renew_0001","provider":"mock","type":"subscription.renewed","userId":"a4e13979-5ca9-4ec9-a20f-72cb152c2e68"}',
      headers: { 'x-billing-webhook-signature': 'sig-invalid' },
      params: {},
      query: {},
      method: 'POST',
      originalUrl: '/api/billing/webhooks/events',
    };

    const validationError = await runMiddleware(route.stack[0].handle as never, req);
    expect(validationError).toBeUndefined();

    let thrown: unknown;
    try {
      await (route.stack[1].handle as (req: unknown, res: unknown) => Promise<void>)(req, {});
    } catch (error) {
      thrown = error;
    }

    const response = renderErrorResponse(thrown, req);
    expect(response.status).toHaveBeenCalledWith(401);
    expect(mockProcessBillingWebhookExecute).not.toHaveBeenCalled();
  });

  it('returns 200 and executes use case when payload and signature are valid', async () => {
    const { billingRoutes } = await setupRouter();
    const route = findRouteLayer(billingRoutes, 'post', '/webhooks/events');
    mockVerifyWebhookSignature.mockReturnValue({
      isValid: true,
      signature: 'sig-valid',
    });
    mockProcessBillingWebhookExecute.mockResolvedValue(
      successResult({ eventId: 'evt_renew_0001', applied: 'planChanged', replayed: false })
    );

    const req = {
      body: {
        eventId: 'evt_renew_0001',
        provider: 'mock',
        type: 'subscription.renewed',
        userId: 'a4e13979-5ca9-4ec9-a20f-72cb152c2e68',
      },
      rawBody:
        '{"eventId":"evt_renew_0001","provider":"mock","type":"subscription.renewed","userId":"a4e13979-5ca9-4ec9-a20f-72cb152c2e68"}',
      headers: { 'x-billing-webhook-signature': 'sig-valid' },
      params: {},
      query: {},
      method: 'POST',
      originalUrl: '/api/billing/webhooks/events',
    };

    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const validationError = await runMiddleware(route.stack[0].handle as never, req);
    expect(validationError).toBeUndefined();
    await (route.stack[1].handle as (req: unknown, res: unknown) => Promise<void>)(req, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(mockProcessBillingWebhookExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: 'evt_renew_0001',
        signature: 'sig-valid',
      })
    );
  });

  it('returns failed billing webhook events list for authenticated user', async () => {
    const { billingRoutes } = await setupRouter();
    const route = findRouteLayer(billingRoutes, 'get', '/webhooks/failed');
    mockGetFailedBillingWebhookEventsExecute.mockResolvedValue(
      successResult({
        events: [
          {
            id: 'bwe-1',
            provider: 'mock',
            eventId: 'evt_1',
            eventType: 'subscription.renewed',
            status: 'FAILED',
            error: 'timeout',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 1,
      })
    );

    const req = {
      user: { id: 'user-1' },
      body: {},
      params: {},
      query: { page: '1', limit: '10' },
      method: 'GET',
      originalUrl: '/api/billing/webhooks/failed',
    };
    const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    const validationError = await runMiddleware(route.stack[1].handle as never, req);
    expect(validationError).toBeUndefined();
    await (route.stack[2].handle as (req: unknown, res: unknown) => Promise<void>)(req, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(mockGetFailedBillingWebhookEventsExecute).toHaveBeenCalledWith({
      userId: 'user-1',
      page: 1,
      limit: 10,
    });
  });

  it('replays failed billing webhook event for authenticated user', async () => {
    const { billingRoutes } = await setupRouter();
    const route = findRouteLayer(billingRoutes, 'post', '/webhooks/failed/:webhookEventId/replay');
    mockReplayFailedBillingWebhookEventExecute.mockResolvedValue(
      successResult({
        webhookEventId: 'bwe-1',
        eventId: 'evt_1',
        applied: 'planChanged',
        replayed: false,
      })
    );

    const req = {
      user: { id: 'user-1' },
      body: {},
      params: { webhookEventId: 'a4e13979-5ca9-4ec9-a20f-72cb152c2e68' },
      query: {},
      method: 'POST',
      originalUrl: '/api/billing/webhooks/failed/a4e13979-5ca9-4ec9-a20f-72cb152c2e68/replay',
    };
    const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    const validationError = await runMiddleware(route.stack[1].handle as never, req);
    expect(validationError).toBeUndefined();
    await (route.stack[2].handle as (req: unknown, res: unknown) => Promise<void>)(req, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(mockReplayFailedBillingWebhookEventExecute).toHaveBeenCalledWith({
      userId: 'user-1',
      webhookEventId: 'a4e13979-5ca9-4ec9-a20f-72cb152c2e68',
    });
  });
});
