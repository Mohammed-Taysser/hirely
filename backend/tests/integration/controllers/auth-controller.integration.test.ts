import { AUTH_CREDENTIAL, failureResult, successResult } from '../../helpers/test-fixtures';
import { NotFoundError, ValidationError } from '@dist/modules/shared/application/app-error';

const mockRegisterExecute = jest.fn();
const mockLoginExecute = jest.fn();
const mockRefreshTokenExecute = jest.fn();
const mockSwitchUserExecute = jest.fn();

jest.mock('@dist/apps/container', () => ({
  authContainer: {
    registerUserUseCase: { execute: (...args: unknown[]) => mockRegisterExecute(...args) },
    loginUseCase: { execute: (...args: unknown[]) => mockLoginExecute(...args) },
    refreshTokenUseCase: { execute: (...args: unknown[]) => mockRefreshTokenExecute(...args) },
    switchUserUseCase: { execute: (...args: unknown[]) => mockSwitchUserExecute(...args) },
  },
}));

let authController: typeof import('@dist/modules/auth/presentation/auth.controller').default;

const buildResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
});

describe('auth controller integration', () => {
  beforeAll(async () => {
    ({ default: authController } = await import('@dist/modules/auth/presentation/auth.controller'));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('register responds with 201 and payload when use case succeeds', async () => {
    mockRegisterExecute.mockResolvedValue(
      successResult({
        user: { id: 'user-1', email: 'john@example.com' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      })
    );

    const req = {
      parsedBody: {
        name: 'John Doe',
        email: 'john@example.com',
        password: AUTH_CREDENTIAL,
      },
    };
    const res = buildResponse();

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'User registered successfully',
      })
    );
  });

  it('register throws mapped http error when use case fails', async () => {
    mockRegisterExecute.mockResolvedValue(failureResult(new ValidationError('Invalid name')));

    const req = {
      parsedBody: {
        name: 'John Doe',
        email: 'john@example.com',
        password: AUTH_CREDENTIAL,
      },
    };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await authController.register(req, res);
    } catch (error) {
      thrown = error;
    }

    expect((thrown as { statusCode?: number }).statusCode).toBe(400);
  });

  it('login throws mapped http error for validation failure', async () => {
    mockLoginExecute.mockResolvedValue(failureResult(new ValidationError('Invalid credentials')));

    const req = {
      parsedBody: {
        email: 'john@example.com',
        password: AUTH_CREDENTIAL,
      },
    };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await authController.login(req, res);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeDefined();

    expect((thrown as { statusCode?: number }).statusCode).toBe(400);
  });

  it('login responds with 200 and payload when successful', async () => {
    mockLoginExecute.mockResolvedValue(
      successResult({
        user: { id: 'user-1', email: 'john@example.com' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      })
    );

    const req = {
      parsedBody: {
        email: 'john@example.com',
        password: AUTH_CREDENTIAL,
      },
    };
    const res = buildResponse();

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Login successful',
      })
    );
  });

  it('refreshToken throws unauthorized http error when use case fails', async () => {
    mockRefreshTokenExecute.mockResolvedValue(
      failureResult(new ValidationError('Invalid or expired refresh token'))
    );

    const req = { parsedBody: { refreshToken: 'invalid-token' } };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await authController.refreshToken(req, res);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeDefined();

    expect((thrown as { statusCode?: number }).statusCode).toBe(401);
  });

  it('refreshToken responds with 200 on success', async () => {
    mockRefreshTokenExecute.mockResolvedValue(
      successResult({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      })
    );

    const req = { parsedBody: { refreshToken: 'valid-token' } };
    const res = buildResponse();

    await authController.refreshToken(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'New access token issued',
      })
    );
  });

  it('switchUser maps not found to bad request', async () => {
    mockSwitchUserExecute.mockResolvedValue(failureResult(new NotFoundError('User not found')));

    const req = { parsedBody: { userId: 'missing-user-id' } };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await authController.switchUser(req, res);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeDefined();
    expect((thrown as { statusCode?: number }).statusCode).toBe(400);
  });

  it('switchUser maps non-not-found errors with app-error mapper', async () => {
    mockSwitchUserExecute.mockResolvedValue(failureResult(new ValidationError('Invalid user id')));

    const req = { parsedBody: { userId: 'bad-id' } };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await authController.switchUser(req, res);
    } catch (error) {
      thrown = error;
    }

    expect((thrown as { statusCode?: number }).statusCode).toBe(400);
  });

  it('switchUser responds with 200 on success', async () => {
    mockSwitchUserExecute.mockResolvedValue(
      successResult({
        user: { id: 'user-2', email: 'switch@example.com' },
        accessToken: 'access-token-2',
        refreshToken: 'refresh-token-2',
      })
    );

    const req = { parsedBody: { userId: 'user-2' } };
    const res = buildResponse();

    await authController.switchUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Switched user successfully',
      })
    );
  });
});
