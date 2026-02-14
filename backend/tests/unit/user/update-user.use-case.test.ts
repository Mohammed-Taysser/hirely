import { UpdateUserUseCase } from '@dist/modules/user/application/use-cases/update-user/update-user.use-case';
import {
  NotFoundError,
  UnexpectedError,
  ValidationError,
} from '@dist/modules/shared/application/app-error';

describe('UpdateUserUseCase', () => {
  const makeDeps = () => {
    const aggregate = {
      id: 'user-1',
      updateName: jest.fn(),
      updateEmail: jest.fn(),
      changePlan: jest.fn(),
    };

    return {
      aggregate,
      userRepository: {
        exists: jest.fn(),
        save: jest.fn().mockResolvedValue(undefined),
        findById: jest.fn().mockResolvedValue(aggregate),
        findByEmail: jest.fn(),
        delete: jest.fn(),
      },
      userQueryRepository: {
        findById: jest.fn().mockResolvedValue({ id: 'user-1', email: 'john@example.com' }),
        findByEmail: jest.fn(),
        findAuthByEmail: jest.fn(),
        getPaginatedUsers: jest.fn(),
        getBasicUsers: jest.fn(),
      },
      systemLogService: { log: jest.fn() },
      auditLogService: { log: jest.fn() },
    };
  };

  it('returns not found when user aggregate is missing', async () => {
    const d = makeDeps();
    d.userRepository.findById.mockResolvedValue(null);

    const useCase = new UpdateUserUseCase(
      d.userRepository,
      d.userQueryRepository,
      d.systemLogService,
      d.auditLogService
    );

    const result = await useCase.execute({ userId: 'missing', name: 'John' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
  });

  it('updates fields and returns updated dto', async () => {
    const d = makeDeps();

    const useCase = new UpdateUserUseCase(
      d.userRepository,
      d.userQueryRepository,
      d.systemLogService,
      d.auditLogService
    );

    const result = await useCase.execute({
      userId: 'user-1',
      name: 'John Updated',
      email: 'updated@example.com',
      planId: 'plan-2',
    });

    expect(result.isSuccess).toBe(true);
    expect(d.aggregate.updateName).toHaveBeenCalled();
    expect(d.aggregate.updateEmail).toHaveBeenCalled();
    expect(d.aggregate.changePlan).toHaveBeenCalledWith('plan-2');
    expect(d.userRepository.save).toHaveBeenCalled();
  });

  it('updates only plan when only planId is provided', async () => {
    const d = makeDeps();

    const useCase = new UpdateUserUseCase(
      d.userRepository,
      d.userQueryRepository,
      d.systemLogService,
      d.auditLogService
    );

    const result = await useCase.execute({
      userId: 'user-1',
      planId: 'plan-3',
    });

    expect(result.isSuccess).toBe(true);
    expect(d.aggregate.updateName).not.toHaveBeenCalled();
    expect(d.aggregate.updateEmail).not.toHaveBeenCalled();
    expect(d.aggregate.changePlan).toHaveBeenCalledWith('plan-3');
  });

  it('returns validation error for invalid email format', async () => {
    const d = makeDeps();

    const useCase = new UpdateUserUseCase(
      d.userRepository,
      d.userQueryRepository,
      d.systemLogService,
      d.auditLogService
    );

    const result = await useCase.execute({ userId: 'user-1', email: 'invalid' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ValidationError);
  });

  it('returns validation error for invalid name', async () => {
    const d = makeDeps();

    const useCase = new UpdateUserUseCase(
      d.userRepository,
      d.userQueryRepository,
      d.systemLogService,
      d.auditLogService
    );

    const result = await useCase.execute({ userId: 'user-1', name: ' ' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ValidationError);
  });

  it('returns not found when updated user cannot be queried', async () => {
    const d = makeDeps();
    d.userQueryRepository.findById.mockResolvedValue(null);

    const useCase = new UpdateUserUseCase(
      d.userRepository,
      d.userQueryRepository,
      d.systemLogService,
      d.auditLogService
    );

    const result = await useCase.execute({ userId: 'user-1', email: 'updated@example.com' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
  });

  it('returns unexpected error on unhandled exception', async () => {
    const d = makeDeps();
    d.userRepository.findById.mockRejectedValue(new Error('db failed'));

    const useCase = new UpdateUserUseCase(
      d.userRepository,
      d.userQueryRepository,
      d.systemLogService,
      d.auditLogService
    );

    const result = await useCase.execute({ userId: 'user-1', name: 'John' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });

  it('logs Unknown error message when thrown value is not Error', async () => {
    const d = makeDeps();
    d.userRepository.findById.mockRejectedValue('db failed');

    const useCase = new UpdateUserUseCase(
      d.userRepository,
      d.userQueryRepository,
      d.systemLogService,
      d.auditLogService
    );

    const result = await useCase.execute({ userId: 'user-1', name: 'John' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
    expect(d.systemLogService.log).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Unknown error' })
    );
  });
});
