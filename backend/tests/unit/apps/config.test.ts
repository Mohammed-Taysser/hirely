const requiredEnv = {
  PORT: '3000',
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/hirely',
  SEED_USER_PASSWORD: 'seed-password',
  JWT_SECRET: 'very-secret-key',
  JWT_ACCESS_EXPIRES_IN: '15m',
  JWT_REFRESH_EXPIRES_IN: '7d',
  REDIS_HOST: 'localhost',
  REDIS_PORT: '6379',
  GOTENBERG_URL: 'http://localhost:3001',
  MAX_RESUME_SECTIONS: '20',
  PLAN_CHANGE_INTERVAL_SECONDS: '300',
};

describe('apps/config', () => {
  const originalEnv = process.env;

  const loadConfigModule = () => {
    const dotenvConfigMock = jest.fn();
    jest.doMock('dotenv', () => ({
      __esModule: true,
      config: (...args: unknown[]) => dotenvConfigMock(...args),
    }));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const config = require('@dist/apps/config').default;

    return { config, dotenvConfigMock };
  };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.ALLOWED_ORIGINS;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('loads valid config for test environment', () => {
    process.env = {
      ...process.env,
      ...requiredEnv,
      NODE_ENV: 'test',
      ALLOWED_ORIGINS: '',
    };

    const { config, dotenvConfigMock } = loadConfigModule();

    expect(config.NODE_ENV).toBe('test');
    expect(config.PORT).toBe(3000);
    expect(config.ALLOWED_ORIGINS).toEqual([]);
    expect(config.MAX_RESUME_SECTIONS).toBe(20);
    expect(dotenvConfigMock).toHaveBeenCalledWith({
      path: '.env.test',
      debug: false,
      quiet: true,
    });
  });

  it('uses defaults for optional values when omitted', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    process.env = {
      ...process.env,
      PORT: requiredEnv.PORT,
      DATABASE_URL: requiredEnv.DATABASE_URL,
      SEED_USER_PASSWORD: requiredEnv.SEED_USER_PASSWORD,
      JWT_SECRET: requiredEnv.JWT_SECRET,
      JWT_ACCESS_EXPIRES_IN: requiredEnv.JWT_ACCESS_EXPIRES_IN,
      JWT_REFRESH_EXPIRES_IN: requiredEnv.JWT_REFRESH_EXPIRES_IN,
      REDIS_HOST: requiredEnv.REDIS_HOST,
      REDIS_PORT: requiredEnv.REDIS_PORT,
      GOTENBERG_URL: requiredEnv.GOTENBERG_URL,
    };
    delete process.env.NODE_ENV;
    delete process.env.MAX_RESUME_SECTIONS;
    delete process.env.PLAN_CHANGE_INTERVAL_SECONDS;
    delete process.env.ALLOWED_ORIGINS;

    const { config } = loadConfigModule();

    expect(config.NODE_ENV).toBe('development');
    expect(config.ALLOWED_ORIGINS).toEqual([]);
    expect(config.MAX_RESUME_SECTIONS).toBe(20);
    expect(config.PLAN_CHANGE_INTERVAL_SECONDS).toBe(300);
    expect(warnSpy).toHaveBeenCalledTimes(1);

    warnSpy.mockRestore();
  });

  it('warns when ALLOWED_ORIGINS is empty outside test', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    process.env = {
      ...process.env,
      ...requiredEnv,
      NODE_ENV: 'development',
      ALLOWED_ORIGINS: '',
    };

    const { config, dotenvConfigMock } = loadConfigModule();

    expect(config.NODE_ENV).toBe('development');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(dotenvConfigMock).toHaveBeenCalledWith({
      path: '.env',
      debug: false,
      quiet: false,
    });
    warnSpy.mockRestore();
  });

  it('exits process when env validation fails', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit called');
    }) as never);

    process.env = {
      ...process.env,
      ...requiredEnv,
      NODE_ENV: 'test',
      JWT_SECRET: 'short',
    };

    const dotenvConfigMock = jest.fn();
    jest.doMock('dotenv', () => ({
      __esModule: true,
      config: (...args: unknown[]) => dotenvConfigMock(...args),
    }));

    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('@dist/apps/config');
    }).toThrow('process.exit called');

    expect(errorSpy).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(dotenvConfigMock).toHaveBeenCalledWith({
      path: '.env.test',
      debug: false,
      quiet: true,
    });

    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it('logs non-zod validation errors and exits', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit called');
    }) as never);

    process.env = {
      ...process.env,
      ...requiredEnv,
      NODE_ENV: 'test',
    };

    const actualZod = jest.requireActual('zod');
    const fakeSafeParse = jest.fn().mockReturnValue({
      success: false,
      error: new Error('custom validation error'),
    });

    jest.doMock('zod', () => ({
      __esModule: true,
      ...actualZod,
      z: {
        ...actualZod.z,
        object: () => ({
          safeParse: (...args: unknown[]) => fakeSafeParse(...args),
        }),
      },
    }));

    const dotenvConfigMock = jest.fn();
    jest.doMock('dotenv', () => ({
      __esModule: true,
      config: (...args: unknown[]) => dotenvConfigMock(...args),
    }));

    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('@dist/apps/config');
    }).toThrow('process.exit called');

    expect(fakeSafeParse).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith('❌ Environment variable validation failed:\n');
    expect(errorSpy).toHaveBeenCalledWith(expect.any(Error));
    expect(exitSpy).toHaveBeenCalledWith(1);

    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });
});
