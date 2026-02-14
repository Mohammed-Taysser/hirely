import { findRouteLayer } from '../helpers/route-inspector.helper';

const setup = () => {
  jest.resetModules();

  const controller = {
    getProfile: jest.fn(),
    getUsersList: jest.fn(),
    getUsers: jest.fn(),
    getUserById: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    changeUserPlan: jest.fn(),
    deleteUser: jest.fn(),
  };

  const dto = {
    getUsersList: { name: 'getUsersList' },
    getUserById: { name: 'getUserById' },
    createUser: { name: 'createUser' },
    updateUser: { name: 'updateUser' },
    changeUserPlan: { name: 'changeUserPlan' },
  };

  const authenticateMiddleware = jest.fn();
  const validateRequest = jest.fn((schema: unknown) => {
    const middleware = jest.fn();
    (middleware as unknown as { __schema: unknown }).__schema = schema;
    return middleware;
  });

  jest.doMock('@dist/modules/user/presentation/user.controller', () => ({
    __esModule: true,
    default: controller,
  }));
  jest.doMock('@dist/modules/user/presentation/user.dto', () => ({
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
  const userRoutes = require('@dist/modules/user/presentation/user.route').default;

  return { userRoutes, controller, dto, authenticateMiddleware, validateRequest };
};

describe('user route integration', () => {
  it('wires protected user endpoints with expected middleware order', () => {
    const { userRoutes, controller, dto, authenticateMiddleware } = setup();

    const me = findRouteLayer(userRoutes, 'get', '/me');
    expect(me.stack[0].handle).toBe(authenticateMiddleware);
    expect(me.stack[1].handle).toBe(controller.getProfile);

    const basic = findRouteLayer(userRoutes, 'get', '/basic');
    expect(basic.stack[0].handle).toBe(authenticateMiddleware);
    expect((basic.stack[1].handle as { __schema: unknown }).__schema).toBe(dto.getUsersList);
    expect(basic.stack[2].handle).toBe(controller.getUsersList);

    const create = findRouteLayer(userRoutes, 'post', '/');
    expect(create.stack[0].handle).toBe(authenticateMiddleware);
    expect((create.stack[1].handle as { __schema: unknown }).__schema).toBe(dto.createUser);
    expect(create.stack[2].handle).toBe(controller.createUser);

    const patch = findRouteLayer(userRoutes, 'patch', '/:userId');
    expect(patch.stack[0].handle).toBe(authenticateMiddleware);
    expect((patch.stack[1].handle as { __schema: unknown }).__schema).toBe(dto.updateUser);
    expect(patch.stack[2].handle).toBe(controller.updateUser);

    const changePlan = findRouteLayer(userRoutes, 'patch', '/:userId/plan');
    expect(changePlan.stack[0].handle).toBe(authenticateMiddleware);
    expect((changePlan.stack[1].handle as { __schema: unknown }).__schema).toBe(
      dto.changeUserPlan
    );
    expect(changePlan.stack[2].handle).toBe(controller.changeUserPlan);

    const remove = findRouteLayer(userRoutes, 'delete', '/:userId');
    expect(remove.stack[0].handle).toBe(authenticateMiddleware);
    expect((remove.stack[1].handle as { __schema: unknown }).__schema).toBe(dto.getUserById);
    expect(remove.stack[2].handle).toBe(controller.deleteUser);
  });

  it('keeps list/get-by-id endpoints public but validated', () => {
    const { userRoutes, controller, dto } = setup();

    const list = findRouteLayer(userRoutes, 'get', '/');
    expect((list.stack[0].handle as { __schema: unknown }).__schema).toBe(dto.getUsersList);
    expect(list.stack[1].handle).toBe(controller.getUsers);

    const byId = findRouteLayer(userRoutes, 'get', '/:userId');
    expect((byId.stack[0].handle as { __schema: unknown }).__schema).toBe(dto.getUserById);
    expect(byId.stack[1].handle).toBe(controller.getUserById);
  });
});
