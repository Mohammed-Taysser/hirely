import { LoginUseCase } from '@dist/modules/auth/application/use-cases/login/login.use-case';
import {
  UnexpectedError,
  ValidationError,
} from '@dist/modules/shared/application/app-error';
import { AUTH_CREDENTIAL } from '../../helpers/test-fixtures';

describe('LoginUseCase', () => {
  it('fails fast for invalid email', async () => {
    const tokenService = {
      signAccessToken: jest.fn(),
      signRefreshToken: jest.fn(),
      verifyToken: jest.fn(),
    };
    const passwordHasher = { hash: jest.fn(), compare: jest.fn() };
    const userQueryRepository = {
      findAuthByEmail: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      getPaginatedUsers: jest.fn(),
      getBasicUsers: jest.fn(),
    };

    const useCase = new LoginUseCase(tokenService, passwordHasher, userQueryRepository);
    const result = await useCase.execute({ email: 'invalid', password: AUTH_CREDENTIAL });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ValidationError);
    expect(result.error?.message).toBe('Email address is invalid');
    expect(userQueryRepository.findAuthByEmail).not.toHaveBeenCalled();
  });

  it('returns tokens and user for valid credentials', async () => {
    const tokenService = {
      signAccessToken: jest.fn().mockReturnValue('access-token'),
      signRefreshToken: jest.fn().mockReturnValue('refresh-token'),
      verifyToken: jest.fn(),
    };
    const passwordHasher = { hash: jest.fn(), compare: jest.fn().mockResolvedValue(true) };
    const userQueryRepository = {
      findAuthByEmail: jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'john@example.com',
        passwordHash: 'hash',
      }),
      findById: jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'john@example.com',
        name: 'John Doe',
        planId: 'plan-1',
        isVerified: true,
      }),
      findByEmail: jest.fn(),
      getPaginatedUsers: jest.fn(),
      getBasicUsers: jest.fn(),
    };

    const useCase = new LoginUseCase(tokenService, passwordHasher, userQueryRepository);
    const result = await useCase.execute({ email: '  john@example.com ', password: AUTH_CREDENTIAL });

    expect(result.isSuccess).toBe(true);
    expect(tokenService.signAccessToken).toHaveBeenCalledWith({
      id: 'user-1',
      email: 'john@example.com',
    });
    expect(tokenService.signRefreshToken).toHaveBeenCalledWith({
      id: 'user-1',
      email: 'john@example.com',
    });
    expect(result.getValue().accessToken).toBe('access-token');
    expect(result.getValue().refreshToken).toBe('refresh-token');
  });

  it('returns unexpected error when repository throws', async () => {
    const tokenService = {
      signAccessToken: jest.fn(),
      signRefreshToken: jest.fn(),
      verifyToken: jest.fn(),
    };
    const passwordHasher = { hash: jest.fn(), compare: jest.fn() };
    const userQueryRepository = {
      findAuthByEmail: jest.fn().mockRejectedValue(new Error('db failed')),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      getPaginatedUsers: jest.fn(),
      getBasicUsers: jest.fn(),
    };

    const useCase = new LoginUseCase(tokenService, passwordHasher, userQueryRepository);
    const result = await useCase.execute({ email: 'john@example.com', password: AUTH_CREDENTIAL });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });

  it('fails when account email is not found', async () => {
    const tokenService = {
      signAccessToken: jest.fn(),
      signRefreshToken: jest.fn(),
      verifyToken: jest.fn(),
    };
    const passwordHasher = { hash: jest.fn(), compare: jest.fn() };
    const userQueryRepository = {
      findAuthByEmail: jest.fn().mockResolvedValue(null),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      getPaginatedUsers: jest.fn(),
      getBasicUsers: jest.fn(),
    };

    const useCase = new LoginUseCase(tokenService, passwordHasher, userQueryRepository);
    const result = await useCase.execute({ email: 'john@example.com', password: AUTH_CREDENTIAL });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ValidationError);
    expect(result.error?.message).toBe('Invalid credentials');
    expect(passwordHasher.compare).not.toHaveBeenCalled();
  });

  it('fails when password does not match', async () => {
    const tokenService = {
      signAccessToken: jest.fn(),
      signRefreshToken: jest.fn(),
      verifyToken: jest.fn(),
    };
    const passwordHasher = { hash: jest.fn(), compare: jest.fn().mockResolvedValue(false) };
    const userQueryRepository = {
      findAuthByEmail: jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'john@example.com',
        passwordHash: 'hash',
      }),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      getPaginatedUsers: jest.fn(),
      getBasicUsers: jest.fn(),
    };

    const useCase = new LoginUseCase(tokenService, passwordHasher, userQueryRepository);
    const result = await useCase.execute({ email: 'john@example.com', password: AUTH_CREDENTIAL });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ValidationError);
    expect(result.error?.message).toBe('Invalid credentials');
    expect(tokenService.signAccessToken).not.toHaveBeenCalled();
  });

  it('fails with unexpected error when full user is missing after auth', async () => {
    const tokenService = {
      signAccessToken: jest.fn().mockReturnValue('access-token'),
      signRefreshToken: jest.fn().mockReturnValue('refresh-token'),
      verifyToken: jest.fn(),
    };
    const passwordHasher = { hash: jest.fn(), compare: jest.fn().mockResolvedValue(true) };
    const userQueryRepository = {
      findAuthByEmail: jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'john@example.com',
        passwordHash: 'hash',
      }),
      findById: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn(),
      getPaginatedUsers: jest.fn(),
      getBasicUsers: jest.fn(),
    };

    const useCase = new LoginUseCase(tokenService, passwordHasher, userQueryRepository);
    const result = await useCase.execute({ email: 'john@example.com', password: AUTH_CREDENTIAL });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });

  it('rejects malformed email forms', async () => {
    const tokenService = {
      signAccessToken: jest.fn(),
      signRefreshToken: jest.fn(),
      verifyToken: jest.fn(),
    };
    const passwordHasher = { hash: jest.fn(), compare: jest.fn() };
    const userQueryRepository = {
      findAuthByEmail: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      getPaginatedUsers: jest.fn(),
      getBasicUsers: jest.fn(),
    };
    const useCase = new LoginUseCase(tokenService, passwordHasher, userQueryRepository);

    const invalidCases = ['john@@example.com', 'john@.example.com', 'john@example.com.'];

    for (const email of invalidCases) {
      const result = await useCase.execute({ email, password: AUTH_CREDENTIAL });
      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error?.message).toBe('Email address is invalid');
    }
  });
});
