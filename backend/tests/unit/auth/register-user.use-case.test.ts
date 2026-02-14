import { RegisterUserUseCase } from '@dist/modules/auth/application/use-cases/register-user/register-user.use-case';
import {
  UnexpectedError,
  ValidationError,
} from '@dist/modules/shared/application/app-error';
import { AUTH_CREDENTIAL, failureResult, successResult } from '../../helpers/test-fixtures';

describe('RegisterUserUseCase', () => {
  it('propagates create-user failure', async () => {
    const createUserWithPlanUseCase = {
      execute: jest
        .fn()
        .mockResolvedValue(failureResult(new ValidationError('User already exists'))),
    };
    const tokenService = {
      signAccessToken: jest.fn(),
      signRefreshToken: jest.fn(),
      verifyToken: jest.fn(),
    };

    const useCase = new RegisterUserUseCase(createUserWithPlanUseCase, tokenService);
    const result = await useCase.execute({
      name: 'John Doe',
      email: 'john@example.com',
      password: AUTH_CREDENTIAL,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ValidationError);
    expect(tokenService.signAccessToken).not.toHaveBeenCalled();
  });

  it('returns user and tokens when registration succeeds', async () => {
    const createUserWithPlanUseCase = {
      execute: jest.fn().mockResolvedValue(
        successResult({
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          planId: 'plan-1',
        })
      ),
    };
    const tokenService = {
      signAccessToken: jest.fn().mockReturnValue('access-token'),
      signRefreshToken: jest.fn().mockReturnValue('refresh-token'),
      verifyToken: jest.fn(),
    };

    const useCase = new RegisterUserUseCase(createUserWithPlanUseCase, tokenService);
    const result = await useCase.execute({
      name: 'John Doe',
      email: 'john@example.com',
      password: AUTH_CREDENTIAL,
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().accessToken).toBe('access-token');
    expect(result.getValue().refreshToken).toBe('refresh-token');
  });

  it('returns unexpected error when token signing fails', async () => {
    const createUserWithPlanUseCase = {
      execute: jest.fn().mockResolvedValue(
        successResult({
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          planId: 'plan-1',
        })
      ),
    };
    const tokenService = {
      signAccessToken: jest.fn(() => {
        throw new Error('sign failed');
      }),
      signRefreshToken: jest.fn(),
      verifyToken: jest.fn(),
    };

    const useCase = new RegisterUserUseCase(createUserWithPlanUseCase, tokenService);
    const result = await useCase.execute({
      name: 'John Doe',
      email: 'john@example.com',
      password: AUTH_CREDENTIAL,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });

  it('returns fallback unexpected error when creation fails without error payload', async () => {
    const createUserWithPlanUseCase = {
      execute: jest.fn().mockResolvedValue({
        isFailure: true,
        error: null,
      }),
    };
    const tokenService = {
      signAccessToken: jest.fn(),
      signRefreshToken: jest.fn(),
      verifyToken: jest.fn(),
    };

    const useCase = new RegisterUserUseCase(createUserWithPlanUseCase, tokenService);
    const result = await useCase.execute({
      name: 'John Doe',
      email: 'john@example.com',
      password: AUTH_CREDENTIAL,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
    expect(result.error?.message).toBe('An unexpected error occurred.');
  });
});
