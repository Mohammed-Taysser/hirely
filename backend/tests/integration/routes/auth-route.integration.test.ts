import { findRouteLayer } from '../helpers/route-inspector.helper';

type SetupResult = {
  authRoutes: { stack: unknown[] };
  controller: Record<string, jest.Mock>;
  dto: Record<string, unknown>;
  authenticateMiddleware: jest.Mock;
  validateRequest: jest.Mock;
};

const setup = (): SetupResult => {
  jest.resetModules();

  const controller = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    switchUser: jest.fn(),
  };

  const dto = {
    register: { name: 'register' },
    login: { name: 'login' },
    refreshToken: { name: 'refreshToken' },
    switchUser: { name: 'switchUser' },
  };

  const authenticateMiddleware = jest.fn();
  const validateRequest = jest.fn((schema: unknown) => {
    const middleware = jest.fn();
    (middleware as unknown as { __schema: unknown }).__schema = schema;
    return middleware;
  });

  jest.doMock('@dist/modules/auth/presentation/auth.controller', () => ({
    __esModule: true,
    default: controller,
  }));
  jest.doMock('@dist/modules/auth/presentation/auth.dto', () => ({
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
  const authRoutes = require('@dist/modules/auth/presentation/auth.route').default;

  return { authRoutes, controller, dto, authenticateMiddleware, validateRequest };
};

describe('auth route integration', () => {
  it('register/login/refresh routes apply validateRequest then controller', () => {
    const { authRoutes, controller, dto, validateRequest } = setup();

    const registerRoute = findRouteLayer(authRoutes, 'post', '/register');
    expect((registerRoute.stack[0].handle as { __schema: unknown }).__schema).toBe(dto.register);
    expect(registerRoute.stack[1].handle).toBe(controller.register);

    const loginRoute = findRouteLayer(authRoutes, 'post', '/login');
    expect((loginRoute.stack[0].handle as { __schema: unknown }).__schema).toBe(dto.login);
    expect(loginRoute.stack[1].handle).toBe(controller.login);

    const refreshRoute = findRouteLayer(authRoutes, 'post', '/refresh-token');
    expect((refreshRoute.stack[0].handle as { __schema: unknown }).__schema).toBe(
      dto.refreshToken
    );
    expect(refreshRoute.stack[1].handle).toBe(controller.refreshToken);

    expect(validateRequest).toHaveBeenCalledWith(dto.register);
    expect(validateRequest).toHaveBeenCalledWith(dto.login);
    expect(validateRequest).toHaveBeenCalledWith(dto.refreshToken);
  });

  it('switch-user route applies auth then validateRequest then controller', () => {
    const { authRoutes, controller, dto, authenticateMiddleware, validateRequest } = setup();

    const switchRoute = findRouteLayer(authRoutes, 'post', '/switch-user');

    expect(switchRoute.stack[0].handle).toBe(authenticateMiddleware);
    expect((switchRoute.stack[1].handle as { __schema: unknown }).__schema).toBe(dto.switchUser);
    expect(switchRoute.stack[2].handle).toBe(controller.switchUser);
    expect(validateRequest).toHaveBeenCalledWith(dto.switchUser);
  });
});
