type LoadedLogger = {
  loggerService: {
    info: (input?: unknown, meta?: Record<string, unknown>) => void;
    error: (input?: unknown, meta?: Record<string, unknown>) => void;
    warn: (input?: unknown, meta?: Record<string, unknown>) => void;
  };
  pinoFactory: jest.Mock;
  pinoLogger: {
    info: jest.Mock;
    error: jest.Mock;
    warn: jest.Mock;
  };
  mkdirSyncMock: jest.Mock;
};

const loadLoggerService = async (
  params?: { nodeEnv?: 'test' | 'production' | 'development'; dirExists?: boolean }
): Promise<LoadedLogger> => {
  jest.resetModules();

  const pinoLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  };
  const pinoFactory = jest.fn().mockReturnValue(pinoLogger);

  const existsSyncMock = jest.fn().mockReturnValue(params?.dirExists ?? true);
  const mkdirSyncMock = jest.fn();

  jest.doMock('pino', () => ({
    __esModule: true,
    default: (...args: unknown[]) => pinoFactory(...args),
  }));

  jest.doMock('node:fs', () => ({
    __esModule: true,
    default: {
      existsSync: (...args: unknown[]) => existsSyncMock(...args),
      mkdirSync: (...args: unknown[]) => mkdirSyncMock(...args),
    },
    existsSync: (...args: unknown[]) => existsSyncMock(...args),
    mkdirSync: (...args: unknown[]) => mkdirSyncMock(...args),
  }));

  jest.doMock('@dist/apps/config', () => ({
    __esModule: true,
    default: {
      NODE_ENV: params?.nodeEnv ?? 'test',
    },
  }));

  const { default: loggerService } = await import(
    '@dist/modules/shared/infrastructure/services/logger.service'
  );

  return { loggerService, pinoFactory, pinoLogger, mkdirSyncMock };
};

describe('logger.service', () => {
  it('creates logs directory when missing', async () => {
    const { mkdirSyncMock } = await loadLoggerService({ dirExists: false });
    expect(mkdirSyncMock).toHaveBeenCalledTimes(1);
  });

  it('uses pino-pretty transport in development', async () => {
    const { pinoFactory } = await loadLoggerService({ nodeEnv: 'development' });
    const options = pinoFactory.mock.calls[0][0];

    expect(options.transport.target).toBe('pino-pretty');
  });

  it('uses silent logger in test environment', async () => {
    const { pinoFactory } = await loadLoggerService({ nodeEnv: 'test' });
    const options = pinoFactory.mock.calls[0][0];

    expect(options.level).toBe('silent');
    expect(options.transport).toBeUndefined();
  });

  it('uses file transport in production', async () => {
    const { pinoFactory } = await loadLoggerService({ nodeEnv: 'production' });
    const options = pinoFactory.mock.calls[0][0];

    expect(options.transport.target).toBe('pino/file');
    expect(options.transport.options.destination).toBe('./logs/app.log');
  });

  it('delegates info/error/warn with and without metadata', async () => {
    const { loggerService, pinoLogger } = await loadLoggerService();

    loggerService.info('info-message');
    loggerService.info('info-message-meta', { context: 'ctx' });
    loggerService.error('error-message');
    loggerService.error('error-message-meta', { context: 'ctx' });
    loggerService.warn('warn-message');
    loggerService.warn('warn-message-meta', { context: 'ctx' });

    expect(pinoLogger.info).toHaveBeenCalledWith('info-message');
    expect(pinoLogger.info).toHaveBeenCalledWith({ context: 'ctx' }, 'info-message-meta');

    expect(pinoLogger.error).toHaveBeenCalledWith('error-message');
    expect(pinoLogger.error).toHaveBeenCalledWith({ context: 'ctx' }, 'error-message-meta');

    expect(pinoLogger.warn).toHaveBeenCalledWith('warn-message');
    expect(pinoLogger.warn).toHaveBeenCalledWith({ context: 'ctx' }, 'warn-message-meta');
  });
});
