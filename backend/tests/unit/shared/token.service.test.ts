type LoadedTokenService = {
  tokenService: {
    signAccessToken: (payload: { id: string; email: string; extra?: string }) => string;
    signRefreshToken: (payload: { id: string; email: string; extra?: string }) => string;
    verifyToken: <T>(token: string) => T;
  };
  signMock: jest.Mock;
  verifyMock: jest.Mock;
};

const loadTokenService = (): LoadedTokenService => {
  jest.resetModules();

  const signMock = jest.fn().mockReturnValue('signed-token');
  const verifyMock = jest.fn().mockReturnValue({ id: 'user-1', email: 'john@example.com' });

  jest.doMock('jsonwebtoken', () => ({
    __esModule: true,
    default: {
      sign: (...args: unknown[]) => signMock(...args),
      verify: (...args: unknown[]) => verifyMock(...args),
    },
  }));

  jest.doMock('@dist/apps/config', () => ({
    __esModule: true,
    default: {
      JWT_SECRET: 'secret-key',
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
    },
  }));

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const tokenService = require('@dist/modules/shared/infrastructure/services/token.service').default;

  return { tokenService, signMock, verifyMock };
};

describe('token.service', () => {
  it('signs access token with sanitized payload and access expiry', () => {
    const { tokenService, signMock } = loadTokenService();

    const token = tokenService.signAccessToken({
      id: 'user-1',
      email: 'john@example.com',
      extra: 'ignored',
    });

    expect(token).toBe('signed-token');
    expect(signMock).toHaveBeenCalledWith(
      { id: 'user-1', email: 'john@example.com' },
      'secret-key',
      { expiresIn: '15m' }
    );
  });

  it('signs refresh token with refresh expiry', () => {
    const { tokenService, signMock } = loadTokenService();

    tokenService.signRefreshToken({ id: 'user-1', email: 'john@example.com' });

    expect(signMock).toHaveBeenCalledWith(
      { id: 'user-1', email: 'john@example.com' },
      'secret-key',
      { expiresIn: '7d' }
    );
  });

  it('verifies token using configured secret', () => {
    const { tokenService, verifyMock } = loadTokenService();

    const payload = tokenService.verifyToken<{ id: string; email: string }>('token');

    expect(verifyMock).toHaveBeenCalledWith('token', 'secret-key');
    expect(payload).toEqual({ id: 'user-1', email: 'john@example.com' });
  });
});
