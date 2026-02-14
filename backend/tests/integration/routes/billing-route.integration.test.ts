import { findRouteLayer } from '../helpers/route-inspector.helper';

const setup = async () => {
  jest.resetModules();

  const controller = {
    processBillingWebhook: jest.fn(),
    getFailedBillingWebhookEvents: jest.fn(),
    replayFailedBillingWebhookEvent: jest.fn(),
  };

  const dto = {
    processBillingWebhook: { name: 'processBillingWebhook' },
    getFailedBillingWebhookEvents: { name: 'getFailedBillingWebhookEvents' },
    replayFailedBillingWebhookEvent: { name: 'replayFailedBillingWebhookEvent' },
  };
  const authenticateMiddleware = jest.fn();

  const validateRequest = jest.fn((schema: unknown) => {
    const middleware = jest.fn();
    (middleware as unknown as { __schema: unknown }).__schema = schema;
    return middleware;
  });

  jest.doMock('@dist/modules/billing/presentation/billing.controller', () => ({
    __esModule: true,
    processBillingWebhook: controller.processBillingWebhook,
    getFailedBillingWebhookEvents: controller.getFailedBillingWebhookEvents,
    replayFailedBillingWebhookEvent: controller.replayFailedBillingWebhookEvent,
  }));
  jest.doMock('@dist/modules/billing/presentation/billing.dto', () => ({
    __esModule: true,
    default: dto,
  }));
  jest.doMock('@dist/middleware/validate-request.middleware', () => ({
    __esModule: true,
    default: validateRequest,
  }));
  jest.doMock('@dist/middleware/authenticate.middleware', () => ({
    __esModule: true,
    default: authenticateMiddleware,
  }));

  const { default: billingRoutes } = await import('@dist/modules/billing/presentation/billing.route');
  return { billingRoutes, controller, dto, authenticateMiddleware };
};

describe('billing route integration', () => {
  it('validates webhook payload before controller', async () => {
    const { billingRoutes, controller, dto } = await setup();

    const processWebhook = findRouteLayer(billingRoutes, 'post', '/webhooks/events');
    expect((processWebhook.stack[0].handle as { __schema: unknown }).__schema).toBe(
      dto.processBillingWebhook
    );
    expect(processWebhook.stack[1].handle).toBe(controller.processBillingWebhook);
  });

  it('protects and validates failed-webhook routes', async () => {
    const { billingRoutes, controller, dto, authenticateMiddleware } = await setup();

    const getFailed = findRouteLayer(billingRoutes, 'get', '/webhooks/failed');
    expect(getFailed.stack[0].handle).toBe(authenticateMiddleware);
    expect((getFailed.stack[1].handle as { __schema: unknown }).__schema).toBe(
      dto.getFailedBillingWebhookEvents
    );
    expect(getFailed.stack[2].handle).toBe(controller.getFailedBillingWebhookEvents);

    const replayFailed = findRouteLayer(
      billingRoutes,
      'post',
      '/webhooks/failed/:webhookEventId/replay'
    );
    expect(replayFailed.stack[0].handle).toBe(authenticateMiddleware);
    expect((replayFailed.stack[1].handle as { __schema: unknown }).__schema).toBe(
      dto.replayFailedBillingWebhookEvent
    );
    expect(replayFailed.stack[2].handle).toBe(controller.replayFailedBillingWebhookEvent);
  });
});
