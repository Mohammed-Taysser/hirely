import { findRouteLayer } from '../helpers/route-inspector.helper';

const setup = () => {
  jest.resetModules();

  const controller = {
    getHealthCheck: jest.fn(),
    getExportOpsMetrics: jest.fn(),
  };

  const dto = {
    getExportOpsMetrics: { name: 'getExportOpsMetrics' },
  };

  const authenticateMiddleware = jest.fn();
  const validateRequest = jest.fn((schema: unknown) => {
    const middleware = jest.fn();
    (middleware as unknown as { __schema: unknown }).__schema = schema;
    return middleware;
  });

  jest.doMock('@dist/modules/system/presentation/system.controller', () => ({
    __esModule: true,
    getHealthCheck: controller.getHealthCheck,
    getExportOpsMetrics: controller.getExportOpsMetrics,
  }));
  jest.doMock('@dist/modules/system/presentation/system.dto', () => ({
    __esModule: true,
    default: dto,
  }));
  jest.doMock('@dist/middleware/authenticate.middleware', () => ({
    __esModule: true,
    default: authenticateMiddleware,
  }));
  jest.doMock('@dist/middleware/validate-request.middleware', () => ({
    __esModule: true,
    default: validateRequest,
  }));

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const systemRoutes = require('@dist/modules/system/presentation/system.route').default;

  return { systemRoutes, controller, dto, authenticateMiddleware };
};

describe('system route integration', () => {
  it('wires health and export ops metrics routes correctly', () => {
    const { systemRoutes, controller, dto, authenticateMiddleware } = setup();

    const healthRoute = findRouteLayer(systemRoutes, 'get', '/health');
    expect(healthRoute.stack[0].handle).toBe(controller.getHealthCheck);

    const metricsRoute = findRouteLayer(systemRoutes, 'get', '/metrics/export-ops');
    expect(metricsRoute.stack[0].handle).toBe(authenticateMiddleware);
    expect((metricsRoute.stack[1].handle as { __schema: unknown }).__schema).toBe(
      dto.getExportOpsMetrics
    );
    expect(metricsRoute.stack[2].handle).toBe(controller.getExportOpsMetrics);
  });
});
