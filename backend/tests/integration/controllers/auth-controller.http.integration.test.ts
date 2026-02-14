import { failureResult, successResult, AUTH_CREDENTIAL } from '../../helpers/test-fixtures';
import { runMiddleware } from '../helpers/http-middleware.helper';
import { findRouteLayer } from '../helpers/route-inspector.helper';

const mockRegisterExecute = jest.fn();
const mockLoginExecute = jest.fn();
const mockRefreshTokenExecute = jest.fn();
const mockSwitchUserExecute = jest.fn();

type SetupAuthRouter = {
  authRoutes: { stack?: unknown[] };
  UnauthorizedError: new (error?: unknown) => { message: string };
  renderErrorResponse: (err: unknown, req: Record<string, unknown>) => {
    status: jest.Mock;
    json: jest.Mock;
  };
};

const setupRouter = async (): Promise<SetupAuthRouter> => {
  jest.resetModules();
  mockRegisterExecute.mockReset();
  mockLoginExecute.mockReset();
  mockRefreshTokenExecute.mockReset();
  mockSwitchUserExecute.mockReset();

  jest.doMock('@dist/apps/container', () => ({
    authContainer: {
      registerUserUseCase: { execute: (...args: unknown[]) => mockRegisterExecute(...args) },
      loginUseCase: { execute: (...args: unknown[]) => mockLoginExecute(...args) },
      refreshTokenUseCase: { execute: (...args: unknown[]) => mockRefreshTokenExecute(...args) },
      switchUserUseCase: { execute: (...args: unknown[]) => mockSwitchUserExecute(...args) },
    },
  }));

  jest.doMock('@dist/middleware/authenticate.middleware', () => ({
    __esModule: true,
    default: (_req: unknown, _res: unknown, next: (err?: unknown) => void) => next(),
  }));

  const { default: authRoutes } = await import('@dist/modules/auth/presentation/auth.route');
  const { default: errorHandlerMiddleware } = await import('@dist/middleware/error-handler.middleware');
  const { UnauthorizedError } = await import('@dist/modules/shared/application/app-error');

  const renderErrorResponse = (err: unknown, req: Record<string, unknown>) => {
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    errorHandlerMiddleware(err, req, response, (() => {}) as never);
    return response;
  };

  return { authRoutes, UnauthorizedError, renderErrorResponse };
};

describe('auth controller http integration', () => {
  it('returns 400 for invalid login payload before reaching use case', async () => {
    const { authRoutes, renderErrorResponse } = await setupRouter();
    const route = findRouteLayer(authRoutes, 'post', '/login');
    const req = {
      body: {
        email: 'bad-email',
        password: AUTH_CREDENTIAL,
      },
      params: {},
      query: {},
      method: 'POST',
      originalUrl: '/api/auth/login',
    };

    const err = await runMiddleware(route.stack[0].handle as never, req);
    const response = renderErrorResponse(err, req);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(mockLoginExecute).not.toHaveBeenCalled();
  });

  it('returns 201 for successful registration', async () => {
    const { authRoutes } = await setupRouter();
    const route = findRouteLayer(authRoutes, 'post', '/register');
    mockRegisterExecute.mockResolvedValue(
      successResult({
        id: 'user-1',
        name: 'John',
        email: 'john@example.com',
      })
    );
    const req = {
      body: {
        name: 'John',
        email: 'john@example.com',
        password: AUTH_CREDENTIAL,
      },
      params: {},
      query: {},
      method: 'POST',
      originalUrl: '/api/auth/register',
    };
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const validationError = await runMiddleware(route.stack[0].handle as never, req);
    expect(validationError).toBeUndefined();
    await (route.stack[1].handle as (req: unknown, res: unknown) => Promise<void>)(req, response);

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'User registered successfully',
      })
    );
  });

  it('maps failed refresh-token result to 401', async () => {
    const { authRoutes, UnauthorizedError, renderErrorResponse } = await setupRouter();
    const route = findRouteLayer(authRoutes, 'post', '/refresh-token');
    mockRefreshTokenExecute.mockResolvedValue(failureResult(new UnauthorizedError('bad token')));

    const request = {
      body: { refreshToken: 'invalid' },
      params: {},
      query: {},
      method: 'POST',
      originalUrl: '/api/auth/refresh-token',
    };
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const validationError = await runMiddleware(route.stack[0].handle as never, request);
    expect(validationError).toBeUndefined();

    let thrown: unknown;
    try {
      await (route.stack[1].handle as (req: unknown, res: unknown) => Promise<void>)(request, response);
    } catch (error) {
      thrown = error;
    }

    const errorResponse = renderErrorResponse(thrown, request);
    expect(errorResponse.status).toHaveBeenCalledWith(401);
  });
});
