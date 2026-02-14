import { failureResult, successResult } from '../../helpers/test-fixtures';

type LoadedAuthenticate = {
  middleware: (
    req: Record<string, unknown>,
    res: Record<string, unknown>,
    next: (err?: unknown) => void
  ) => Promise<void>;
  verifyToken: jest.Mock;
  execute: jest.Mock;
};

const loadAuthenticate = (): LoadedAuthenticate => {
  jest.resetModules();

  const verifyToken = jest.fn();
  const execute = jest.fn();

  const mockedContainer = {
    userContainer: {
      getUserByIdQueryUseCase: {
        execute: (...args: unknown[]) => execute(...args),
      },
    },
  };

  jest.doMock('@dist/modules/shared/infrastructure/services/token.service', () => ({
    __esModule: true,
    default: {
      verifyToken: (...args: unknown[]) => verifyToken(...args),
    },
  }));

  jest.doMock('@dist/apps/container.js', () => mockedContainer);
  jest.doMock('@dist/apps/container', () => mockedContainer);

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const middleware = require('@dist/middleware/authenticate.middleware').default;

  return { middleware, verifyToken, execute };
};

const runMiddleware = async (
  middleware: LoadedAuthenticate['middleware'],
  req: Record<string, unknown>
): Promise<unknown> =>
  new Promise((resolve) => {
    middleware(req, {}, (err?: unknown) => resolve(err));
  });

describe('authenticate middleware integration - authenticated flow', () => {
  it('trims bearer token before verification', async () => {
    const { middleware, verifyToken, execute } = loadAuthenticate();
    verifyToken.mockReturnValue({ id: 'user-1' });
    execute.mockResolvedValue(
      successResult({
        id: 'user-1',
        planId: 'plan-free',
        name: 'John Doe',
        email: 'john@example.com',
        isVerified: true,
      })
    );

    const req: Record<string, unknown> = {
      headers: { authorization: 'Bearer valid-token\t' },
      originalUrl: '/api/users/me',
      method: 'GET',
    };

    const err = await runMiddleware(middleware, req);

    expect(err).toBeUndefined();
    expect(verifyToken).toHaveBeenCalledWith('valid-token');
  });

  it('returns unauthorized when token payload has no user id', async () => {
    const { middleware, verifyToken, execute } = loadAuthenticate();
    verifyToken.mockReturnValue({});

    const req = {
      headers: { authorization: 'Bearer valid-token' },
      originalUrl: '/api/users/me',
      method: 'GET',
    };

    const err = await runMiddleware(middleware, req);

    expect(err).toMatchObject({ statusCode: 401, message: '"Invalid token payload"' });
    expect(execute).not.toHaveBeenCalled();
  });

  it('returns unauthorized when user is not found', async () => {
    const { middleware, verifyToken, execute } = loadAuthenticate();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { NotFoundError } = require('@dist/modules/shared/application/app-error');

    verifyToken.mockReturnValue({ id: 'missing-user' });
    execute.mockResolvedValue(failureResult(new NotFoundError('User not found')));

    const req = {
      headers: { authorization: 'Bearer valid-token' },
      originalUrl: '/api/users/me',
      method: 'GET',
    };

    const err = await runMiddleware(middleware, req);

    expect(err).toMatchObject({ statusCode: 401, message: '"User not found"' });
  });

  it('returns internal error when user query fails with non-not-found error', async () => {
    const { middleware, verifyToken, execute } = loadAuthenticate();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { UnexpectedError } = require('@dist/modules/shared/application/app-error');

    verifyToken.mockReturnValue({ id: 'user-1' });
    execute.mockResolvedValue(failureResult(new UnexpectedError(new Error('boom'))));

    const req = {
      headers: { authorization: 'Bearer valid-token' },
      originalUrl: '/api/users/me',
      method: 'GET',
    };

    const err = await runMiddleware(middleware, req);

    expect(err).toMatchObject({ statusCode: 500, message: '"Internal Server Error"' });
  });

  it('attaches authenticated user to request when token and user are valid', async () => {
    const { middleware, verifyToken, execute } = loadAuthenticate();
    verifyToken.mockReturnValue({ id: 'user-1' });
    execute.mockResolvedValue(
      successResult({
        id: 'user-1',
        planId: 'plan-free',
        name: 'John Doe',
        email: 'john@example.com',
        isVerified: true,
      })
    );

    const req: Record<string, unknown> = {
      headers: { authorization: 'Bearer valid-token' },
      originalUrl: '/api/users/me',
      method: 'GET',
    };

    const err = await runMiddleware(middleware, req);

    expect(err).toBeUndefined();
    expect(execute).toHaveBeenCalledWith({ userId: 'user-1' });
    expect(req.user).toEqual({
      id: 'user-1',
      planId: 'plan-free',
      name: 'John Doe',
      email: 'john@example.com',
      isVerified: true,
    });
  });

  it('passes thrown dependency errors to next handler', async () => {
    const { middleware, verifyToken, execute } = loadAuthenticate();
    const dependencyError = new Error('database unavailable');
    verifyToken.mockReturnValue({ id: 'user-1' });
    execute.mockRejectedValue(dependencyError);

    const req: Record<string, unknown> = {
      headers: { authorization: 'Bearer valid-token' },
      originalUrl: '/api/users/me',
      method: 'GET',
    };

    const err = await runMiddleware(middleware, req);

    expect(err).toBe(dependencyError);
  });
});
