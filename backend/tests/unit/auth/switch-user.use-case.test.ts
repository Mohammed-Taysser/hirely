import { SwitchUserUseCase } from '@dist/modules/auth/application/use-cases/switch-user/switch-user.use-case';
import {
  NotFoundError,
  UnexpectedError,
} from '@dist/modules/shared/application/app-error';

describe('SwitchUserUseCase', () => {
  it('returns tokens for existing user', async () => {
    const userQueryRepository = {
      findById: jest
        .fn()
        .mockResolvedValueOnce({ id: 'user-1', email: 'john@example.com' })
        .mockResolvedValueOnce({
          id: 'user-1',
          email: 'john@example.com',
          name: 'John Doe',
          planId: 'plan-1',
        }),
      findByEmail: jest.fn(),
      findAuthByEmail: jest.fn(),
      getPaginatedUsers: jest.fn(),
      getBasicUsers: jest.fn(),
    };

    const tokenService = {
      signAccessToken: jest.fn().mockReturnValue('access-token'),
      signRefreshToken: jest.fn().mockReturnValue('refresh-token'),
      verifyToken: jest.fn(),
    };

    const useCase = new SwitchUserUseCase(userQueryRepository, tokenService);
    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().accessToken).toBe('access-token');
    expect(result.getValue().refreshToken).toBe('refresh-token');
  });

  it('returns not found when user does not exist', async () => {
    const userQueryRepository = {
      findById: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn(),
      findAuthByEmail: jest.fn(),
      getPaginatedUsers: jest.fn(),
      getBasicUsers: jest.fn(),
    };

    const tokenService = {
      signAccessToken: jest.fn(),
      signRefreshToken: jest.fn(),
      verifyToken: jest.fn(),
    };

    const useCase = new SwitchUserUseCase(userQueryRepository, tokenService);
    const result = await useCase.execute({ userId: 'missing-user' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
  });

  it('returns unexpected error on repository exception', async () => {
    const userQueryRepository = {
      findById: jest.fn().mockRejectedValue(new Error('db failed')),
      findByEmail: jest.fn(),
      findAuthByEmail: jest.fn(),
      getPaginatedUsers: jest.fn(),
      getBasicUsers: jest.fn(),
    };

    const tokenService = {
      signAccessToken: jest.fn(),
      signRefreshToken: jest.fn(),
      verifyToken: jest.fn(),
    };

    const useCase = new SwitchUserUseCase(userQueryRepository, tokenService);
    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });

  it('returns not found when full user is missing after token generation', async () => {
    const userQueryRepository = {
      findById: jest
        .fn()
        .mockResolvedValueOnce({ id: 'user-1', email: 'john@example.com' })
        .mockResolvedValueOnce(null),
      findByEmail: jest.fn(),
      findAuthByEmail: jest.fn(),
      getPaginatedUsers: jest.fn(),
      getBasicUsers: jest.fn(),
    };

    const tokenService = {
      signAccessToken: jest.fn().mockReturnValue('access-token'),
      signRefreshToken: jest.fn().mockReturnValue('refresh-token'),
      verifyToken: jest.fn(),
    };

    const useCase = new SwitchUserUseCase(userQueryRepository, tokenService);
    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
    expect(result.error?.message).toBe('User not found');
  });
});
