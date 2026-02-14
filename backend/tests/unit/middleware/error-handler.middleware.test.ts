type Loaded = {
  middleware: (
    err: unknown,
    req: Record<string, unknown>,
    res: { status: jest.Mock; json: jest.Mock },
    next: (err?: unknown) => void
  ) => void;
  loggerWarn: jest.Mock;
  errorService: {
    badRequest: (error?: unknown) => { statusCode: number; message: string };
  };
};

const loadErrorHandler = (nodeEnv: 'development' | 'test' = 'test'): Loaded => {
  jest.resetModules();

  const loggerWarn = jest.fn();

  jest.doMock('@dist/apps/config', () => ({
    __esModule: true,
    default: { NODE_ENV: nodeEnv },
  }));

  jest.doMock('@dist/modules/shared/infrastructure/services/logger.service', () => ({
    __esModule: true,
    default: {
      warn: (...args: unknown[]) => loggerWarn(...args),
    },
  }));

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const middleware = require('@dist/middleware/error-handler.middleware').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const errorService = require('@dist/modules/shared/presentation/error.service').default;

  return { middleware, loggerWarn, errorService };
};

describe('error-handler middleware', () => {
  it('handles BaseError with JSON payload message', () => {
    const { middleware, errorService } = loadErrorHandler('test');
    const req = { originalUrl: '/api/test', method: 'GET' };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    const err = errorService.badRequest({ field: 'email', message: 'invalid' });
    middleware(err, req, res, () => undefined);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { field: 'email', message: 'invalid' },
    });
  });

  it('handles BaseError with non-JSON message fallback', () => {
    const { middleware, errorService } = loadErrorHandler('test');
    const req = { originalUrl: '/api/test', method: 'GET' };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    const err = errorService.badRequest('bad');
    err.message = 'plain-message';

    middleware(err, req, res, () => undefined);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'plain-message',
    });
  });

  it('handles unknown errors as 500', () => {
    const { middleware } = loadErrorHandler('test');
    const req = { originalUrl: '/api/test', method: 'GET' };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    middleware(new Error('boom'), req, res, () => undefined);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Internal Server Error',
    });
  });

  it('includes debug details and logs warning in development', () => {
    const { middleware, loggerWarn, errorService } = loadErrorHandler('development');
    const req = { originalUrl: '/api/test', method: 'POST' };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    const err = errorService.badRequest('bad');
    middleware(err, req, res, () => undefined);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'bad',
        path: '/api/test',
        method: 'POST',
      })
    );
    expect(loggerWarn).toHaveBeenCalledTimes(1);
  });
});
