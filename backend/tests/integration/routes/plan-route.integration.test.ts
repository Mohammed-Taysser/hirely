import { findRouteLayer } from '../helpers/route-inspector.helper';

const setup = async () => {
  jest.resetModules();

  const controller = {
    getPlans: jest.fn(),
    getPlanById: jest.fn(),
    createPlan: jest.fn(),
    updatePlan: jest.fn(),
    deletePlan: jest.fn(),
  };

  const dto = {
    getPlans: { name: 'getPlans' },
    getPlanById: { name: 'getPlanById' },
    createPlan: { name: 'createPlan' },
    updatePlan: { name: 'updatePlan' },
  };

  const authenticateMiddleware = jest.fn();
  const validateRequest = jest.fn((schema: unknown) => {
    const middleware = jest.fn();
    (middleware as unknown as { __schema: unknown }).__schema = schema;
    return middleware;
  });

  jest.doMock('@dist/modules/plan/presentation/plan.controller', () => ({
    __esModule: true,
    default: controller,
  }));
  jest.doMock('@dist/modules/plan/presentation/plan.dto', () => ({
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

  const { default: planRoutes } = await import('@dist/modules/plan/presentation/plan.route');
  return { planRoutes, controller, dto, authenticateMiddleware, validateRequest };
};

describe('plan route integration', () => {
  it('all plan routes are protected and validated before controller', async () => {
    const { planRoutes, controller, dto, authenticateMiddleware } = await setup();

    const getPlans = findRouteLayer(planRoutes, 'get', '/');
    expect(getPlans.stack[0].handle).toBe(authenticateMiddleware);
    expect((getPlans.stack[1].handle as { __schema: unknown }).__schema).toBe(dto.getPlans);
    expect(getPlans.stack[2].handle).toBe(controller.getPlans);

    const getPlanById = findRouteLayer(planRoutes, 'get', '/:planId');
    expect(getPlanById.stack[0].handle).toBe(authenticateMiddleware);
    expect((getPlanById.stack[1].handle as { __schema: unknown }).__schema).toBe(dto.getPlanById);
    expect(getPlanById.stack[2].handle).toBe(controller.getPlanById);

    const createPlan = findRouteLayer(planRoutes, 'post', '/');
    expect(createPlan.stack[0].handle).toBe(authenticateMiddleware);
    expect((createPlan.stack[1].handle as { __schema: unknown }).__schema).toBe(dto.createPlan);
    expect(createPlan.stack[2].handle).toBe(controller.createPlan);

    const updatePlan = findRouteLayer(planRoutes, 'patch', '/:planId');
    expect(updatePlan.stack[0].handle).toBe(authenticateMiddleware);
    expect((updatePlan.stack[1].handle as { __schema: unknown }).__schema).toBe(dto.updatePlan);
    expect(updatePlan.stack[2].handle).toBe(controller.updatePlan);

    const deletePlan = findRouteLayer(planRoutes, 'delete', '/:planId');
    expect(deletePlan.stack[0].handle).toBe(authenticateMiddleware);
    expect((deletePlan.stack[1].handle as { __schema: unknown }).__schema).toBe(dto.getPlanById);
    expect(deletePlan.stack[2].handle).toBe(controller.deletePlan);
  });
});
