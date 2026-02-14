import { RefreshTokenUseCase } from '@dist/modules/auth/application/use-cases/refresh-token/refresh-token.use-case';
import { ValidationError } from '@dist/modules/shared/application/app-error';

describe('RefreshTokenUseCase', () => {
  it('returns new access and refresh tokens for valid refresh token', async () => {
    const tokenService = {
      verifyToken: jest.fn().mockReturnValue({ id: 'user-1', email: 'john@example.com' }),
      signAccessToken: jest.fn().mockReturnValue('new-access-token'),
      signRefreshToken: jest.fn().mockReturnValue('new-refresh-token'),
    };

    const useCase = new RefreshTokenUseCase(tokenService);
    const result = await useCase.execute({ refreshToken: 'old-refresh-token' });

    expect(result.isSuccess).toBe(true);
    expect(tokenService.verifyToken).toHaveBeenCalledWith('old-refresh-token');
    expect(result.getValue()).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
  });

  it('returns validation error when refresh token is invalid', async () => {
    const tokenService = {
      verifyToken: jest.fn(() => {
        throw new Error('invalid token');
      }),
      signAccessToken: jest.fn(),
      signRefreshToken: jest.fn(),
    };

    const useCase = new RefreshTokenUseCase(tokenService);
    const result = await useCase.execute({ refreshToken: 'invalid' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ValidationError);
    expect(result.error?.message).toBe('Invalid or expired refresh token');
  });

  it('returns validation error when token service throws non-error value', async () => {
    const tokenService = {
      verifyToken: jest.fn(() => {
        throw 'invalid token';
      }),
      signAccessToken: jest.fn(),
      signRefreshToken: jest.fn(),
    };

    const useCase = new RefreshTokenUseCase(tokenService);
    const result = await useCase.execute({ refreshToken: 'invalid' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ValidationError);
    expect(result.error?.message).toBe('Invalid or expired refresh token');
  });
});
