type LoadedRateLimiter = {
  rateLimiter: (options: { max: number; windowSeconds: number; keyTemplate: string }) => (
    req: { ip: string },
    res: { setHeader: jest.Mock },
    next: (err?: unknown) => void
  ) => Promise<void>;
  cacheService: {
    formatKey: jest.Mock;
    incrWithTTL: jest.Mock;
    ttl: jest.Mock;
  };
  loggerError: jest.Mock;
  tooManyRequests: jest.Mock;
};

const loadRateLimiter = (): LoadedRateLimiter => {
  jest.resetModules();

  const cacheService = {
    formatKey: jest.fn(),
    incrWithTTL: jest.fn(),
    ttl: jest.fn(),
  };
  const loggerError = jest.fn();
  const tooManyRequests = jest.fn((message: string) => ({ statusCode: 429, message }));

  jest.doMock('@dist/modules/shared/infrastructure/services/cache.service', () => ({
    __esModule: true,
    default: cacheService,
  }));
  jest.doMock('@dist/modules/shared/infrastructure/services/logger.service', () => ({
    __esModule: true,
    default: {
      error: (...args: unknown[]) => loggerError(...args),
    },
  }));
  jest.doMock('@dist/modules/shared/presentation/error.service', () => ({
    __esModule: true,
    default: {
      tooManyRequests: (message: string) => tooManyRequests(message),
    },
  }));

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const rateLimiter = require('@dist/middleware/rate-limit.middleware').default;

  return { rateLimiter, cacheService, loggerError, tooManyRequests };
};

describe('rate-limit middleware', () => {
  it('sets headers and allows request when within limit', async () => {
    const { rateLimiter, cacheService } = loadRateLimiter();
    cacheService.formatKey.mockReturnValue('redis:rate-limit:ip:127.0.0.1');
    cacheService.incrWithTTL.mockResolvedValue(4);
    cacheService.ttl.mockResolvedValue(19);

    const middleware = rateLimiter({ max: 5, windowSeconds: 60, keyTemplate: 'redis:rate-limit:ip:{ip}' });
    const req = { ip: '127.0.0.1' };
    const res = { setHeader: jest.fn() };
    const next = jest.fn();

    await middleware(req, res, next);

    expect(cacheService.formatKey).toHaveBeenCalledWith('redis:rate-limit:ip:{ip}', { ip: '127.0.0.1' });
    expect(cacheService.incrWithTTL).toHaveBeenCalledWith('redis:rate-limit:ip:127.0.0.1', 60);
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 5);
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 1);
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Reset', 19);
    expect(next).toHaveBeenCalledWith();
  });

  it('returns too many requests error when limit is exceeded', async () => {
    const { rateLimiter, cacheService, tooManyRequests } = loadRateLimiter();
    const blockedError = new Error('blocked');
    cacheService.formatKey.mockReturnValue('redis:rate-limit:ip:127.0.0.1');
    cacheService.incrWithTTL.mockResolvedValue(6);
    cacheService.ttl.mockResolvedValue(30);
    tooManyRequests.mockReturnValue(blockedError);

    const middleware = rateLimiter({ max: 5, windowSeconds: 60, keyTemplate: 'redis:rate-limit:ip:{ip}' });
    const req = { ip: '127.0.0.1' };
    const res = { setHeader: jest.fn() };
    const next = jest.fn();

    await middleware(req, res, next);

    expect(tooManyRequests).toHaveBeenCalledWith('Too many requests, please try again later.');
    expect(next).toHaveBeenCalledWith(blockedError);
  });

  it('fails open and logs when cache fails', async () => {
    const { rateLimiter, cacheService, loggerError } = loadRateLimiter();
    const redisError = new Error('redis unavailable');
    cacheService.formatKey.mockReturnValue('redis:rate-limit:ip:127.0.0.1');
    cacheService.incrWithTTL.mockRejectedValue(redisError);

    const middleware = rateLimiter({ max: 5, windowSeconds: 60, keyTemplate: 'redis:rate-limit:ip:{ip}' });
    const req = { ip: '127.0.0.1' };
    const res = { setHeader: jest.fn() };
    const next = jest.fn();

    await middleware(req, res, next);

    expect(loggerError).toHaveBeenCalledWith('Rate limiter error', { error: redisError });
    expect(next).toHaveBeenCalledWith();
  });

  it('uses default max and windowSeconds when omitted', async () => {
    const { rateLimiter, cacheService } = loadRateLimiter();
    cacheService.formatKey.mockReturnValue('redis:rate-limit:ip:127.0.0.1');
    cacheService.incrWithTTL.mockResolvedValue(1);
    cacheService.ttl.mockResolvedValue(59);

    const middleware = rateLimiter({ keyTemplate: 'redis:rate-limit:ip:{ip}' } as never);
    const req = { ip: '127.0.0.1' };
    const res = { setHeader: jest.fn() };
    const next = jest.fn();

    await middleware(req, res, next);

    expect(cacheService.incrWithTTL).toHaveBeenCalledWith('redis:rate-limit:ip:127.0.0.1', 60);
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 1000);
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 999);
    expect(next).toHaveBeenCalledWith();
  });
});
