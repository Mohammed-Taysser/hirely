import { DeleteUserUseCase } from '@dist/modules/user/application/use-cases/delete-user/delete-user.use-case';
import {
  NotFoundError,
  UnexpectedError,
} from '@dist/modules/shared/application/app-error';

describe('DeleteUserUseCase', () => {
  it('returns not found for missing user', async () => {
    const userRepository = {
      exists: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      delete: jest.fn(),
    };
    const userQueryRepository = {
      findById: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn(),
      findAuthByEmail: jest.fn(),
      getPaginatedUsers: jest.fn(),
      getBasicUsers: jest.fn(),
    };
    const systemLogService = { log: jest.fn() };
    const auditLogService = { log: jest.fn() };

    const useCase = new DeleteUserUseCase(
      userRepository,
      userQueryRepository,
      systemLogService,
      auditLogService
    );

    const result = await useCase.execute({ userId: 'missing' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
    expect(userRepository.delete).not.toHaveBeenCalled();
  });

  it('deletes user and returns deleted dto', async () => {
    const userRepository = {
      exists: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    const userQueryRepository = {
      findById: jest.fn().mockResolvedValue({ id: 'user-1', email: 'john@example.com' }),
      findByEmail: jest.fn(),
      findAuthByEmail: jest.fn(),
      getPaginatedUsers: jest.fn(),
      getBasicUsers: jest.fn(),
    };
    const systemLogService = { log: jest.fn() };
    const auditLogService = { log: jest.fn() };

    const useCase = new DeleteUserUseCase(
      userRepository,
      userQueryRepository,
      systemLogService,
      auditLogService
    );

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.isSuccess).toBe(true);
    expect(userRepository.delete).toHaveBeenCalledWith('user-1');
    expect(systemLogService.log).toHaveBeenCalled();
    expect(auditLogService.log).toHaveBeenCalled();
  });

  it('returns unexpected error when delete fails', async () => {
    const userRepository = {
      exists: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      delete: jest.fn().mockRejectedValue(new Error('db failed')),
    };
    const userQueryRepository = {
      findById: jest.fn().mockResolvedValue({ id: 'user-1', email: 'john@example.com' }),
      findByEmail: jest.fn(),
      findAuthByEmail: jest.fn(),
      getPaginatedUsers: jest.fn(),
      getBasicUsers: jest.fn(),
    };
    const systemLogService = { log: jest.fn() };
    const auditLogService = { log: jest.fn() };

    const useCase = new DeleteUserUseCase(
      userRepository,
      userQueryRepository,
      systemLogService,
      auditLogService
    );

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });

  it('logs Unknown error message when thrown value is not Error', async () => {
    const userRepository = {
      exists: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      delete: jest.fn().mockRejectedValue('db failed'),
    };
    const userQueryRepository = {
      findById: jest.fn().mockResolvedValue({ id: 'user-1', email: 'john@example.com' }),
      findByEmail: jest.fn(),
      findAuthByEmail: jest.fn(),
      getPaginatedUsers: jest.fn(),
      getBasicUsers: jest.fn(),
    };
    const systemLogService = { log: jest.fn() };
    const auditLogService = { log: jest.fn() };

    const useCase = new DeleteUserUseCase(
      userRepository,
      userQueryRepository,
      systemLogService,
      auditLogService
    );

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
    expect(systemLogService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Unknown error',
      })
    );
  });
});
