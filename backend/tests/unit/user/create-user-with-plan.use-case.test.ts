import { CreateUserWithPlanUseCase } from '@dist/modules/user/application/use-cases/create-user-with-plan/create-user-with-plan.use-case';
import { User } from '@dist/modules/user/domain/user.aggregate';
import { UserPassword } from '@dist/modules/user/domain/value-objects/user-password.vo';
import {
  ConflictError,
  NotFoundError,
  UnexpectedError,
  ValidationError,
} from '@dist/modules/shared/application/app-error';
import { Result } from '@dist/modules/shared/domain/result';
import { AUTH_CREDENTIAL, SHORT_CREDENTIAL } from '../../helpers/test-fixtures';

describe('CreateUserWithPlanUseCase', () => {
  const request = {
    name: 'John Doe',
    email: 'john@example.com',
    password: AUTH_CREDENTIAL,
  };

  it('returns not found when plan code does not exist', async () => {
    const planQueryRepository = {
      findByCode: jest.fn().mockResolvedValue(null),
      findById: jest.fn(),
      getPaginatedPlans: jest.fn(),
    };
    const userRepository = {
      exists: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      delete: jest.fn(),
    };
    const passwordHasher = { hash: jest.fn(), compare: jest.fn() };
    const userQueryRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAuthByEmail: jest.fn(),
      getPaginatedUsers: jest.fn(),
      getBasicUsers: jest.fn(),
    };
    const systemLogService = { log: jest.fn() };
    const auditLogService = { log: jest.fn() };

    const useCase = new CreateUserWithPlanUseCase(
      planQueryRepository,
      userRepository,
      passwordHasher,
      userQueryRepository,
      systemLogService,
      auditLogService
    );

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
  });

  it('returns conflict when user already exists', async () => {
    const planQueryRepository = {
      findByCode: jest.fn().mockResolvedValue({ id: 'plan-1', code: 'FREE' }),
      findById: jest.fn(),
      getPaginatedPlans: jest.fn(),
    };
    const userRepository = {
      exists: jest.fn().mockResolvedValue(true),
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      delete: jest.fn(),
    };
    const passwordHasher = { hash: jest.fn(), compare: jest.fn() };
    const userQueryRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAuthByEmail: jest.fn(),
      getPaginatedUsers: jest.fn(),
      getBasicUsers: jest.fn(),
    };
    const systemLogService = { log: jest.fn() };
    const auditLogService = { log: jest.fn() };

    const useCase = new CreateUserWithPlanUseCase(
      planQueryRepository,
      userRepository,
      passwordHasher,
      userQueryRepository,
      systemLogService,
      auditLogService
    );

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ConflictError);
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('creates user and returns full dto', async () => {
    const planQueryRepository = {
      findByCode: jest.fn().mockResolvedValue({ id: 'plan-1', code: 'FREE' }),
      findById: jest.fn(),
      getPaginatedPlans: jest.fn(),
    };
    const userRepository = {
      exists: jest.fn().mockResolvedValue(false),
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      delete: jest.fn(),
    };
    const passwordHasher = { hash: jest.fn().mockResolvedValue('hashed-password'), compare: jest.fn() };
    const userQueryRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        planId: 'plan-1',
        isVerified: false,
        isDeleted: false,
      }),
      findByEmail: jest.fn(),
      findAuthByEmail: jest.fn(),
      getPaginatedUsers: jest.fn(),
      getBasicUsers: jest.fn(),
    };
    const systemLogService = { log: jest.fn() };
    const auditLogService = { log: jest.fn() };

    const useCase = new CreateUserWithPlanUseCase(
      planQueryRepository,
      userRepository,
      passwordHasher,
      userQueryRepository,
      systemLogService,
      auditLogService
    );

    const result = await useCase.execute(request);

    expect(result.isSuccess).toBe(true);
    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(systemLogService.log).toHaveBeenCalled();
    expect(auditLogService.log).toHaveBeenCalled();
  });

  it('returns validation error for invalid input', async () => {
    const planQueryRepository = {
      findByCode: jest.fn().mockResolvedValue({ id: 'plan-1', code: 'FREE' }),
      findById: jest.fn(),
      getPaginatedPlans: jest.fn(),
    };
    const userRepository = {
      exists: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      delete: jest.fn(),
    };
    const passwordHasher = { hash: jest.fn(), compare: jest.fn() };
    const userQueryRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAuthByEmail: jest.fn(),
      getPaginatedUsers: jest.fn(),
      getBasicUsers: jest.fn(),
    };
    const systemLogService = { log: jest.fn() };
    const auditLogService = { log: jest.fn() };

    const useCase = new CreateUserWithPlanUseCase(
      planQueryRepository,
      userRepository,
      passwordHasher,
      userQueryRepository,
      systemLogService,
      auditLogService
    );

    const result = await useCase.execute({ ...request, password: SHORT_CREDENTIAL });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ValidationError);
  });

  it('returns unexpected error on unhandled exception', async () => {
    const planQueryRepository = {
      findByCode: jest.fn().mockRejectedValue(new Error('db failed')),
      findById: jest.fn(),
      getPaginatedPlans: jest.fn(),
    };
    const userRepository = {
      exists: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      delete: jest.fn(),
    };
    const passwordHasher = { hash: jest.fn(), compare: jest.fn() };
    const userQueryRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAuthByEmail: jest.fn(),
      getPaginatedUsers: jest.fn(),
      getBasicUsers: jest.fn(),
    };
    const systemLogService = { log: jest.fn() };
    const auditLogService = { log: jest.fn() };

    const useCase = new CreateUserWithPlanUseCase(
      planQueryRepository,
      userRepository,
      passwordHasher,
      userQueryRepository,
      systemLogService,
      auditLogService
    );

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });

  it('logs Unknown error message when thrown value is not Error', async () => {
    const planQueryRepository = {
      findByCode: jest.fn().mockRejectedValue('db failed'),
      findById: jest.fn(),
      getPaginatedPlans: jest.fn(),
    };
    const userRepository = {
      exists: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      delete: jest.fn(),
    };
    const passwordHasher = { hash: jest.fn(), compare: jest.fn() };
    const userQueryRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAuthByEmail: jest.fn(),
      getPaginatedUsers: jest.fn(),
      getBasicUsers: jest.fn(),
    };
    const systemLogService = { log: jest.fn() };
    const auditLogService = { log: jest.fn() };

    const useCase = new CreateUserWithPlanUseCase(
      planQueryRepository,
      userRepository,
      passwordHasher,
      userQueryRepository,
      systemLogService,
      auditLogService
    );

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
    expect(systemLogService.log).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Unknown error' })
    );
  });

  it('uses FREE as default plan code when planCode is missing', async () => {
    const planQueryRepository = {
      findByCode: jest.fn().mockResolvedValue({ id: 'plan-1', code: 'FREE' }),
      findById: jest.fn(),
      getPaginatedPlans: jest.fn(),
    };
    const userRepository = {
      exists: jest.fn().mockResolvedValue(true),
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      delete: jest.fn(),
    };
    const passwordHasher = { hash: jest.fn(), compare: jest.fn() };
    const userQueryRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAuthByEmail: jest.fn(),
      getPaginatedUsers: jest.fn(),
      getBasicUsers: jest.fn(),
    };
    const systemLogService = { log: jest.fn() };
    const auditLogService = { log: jest.fn() };

    const useCase = new CreateUserWithPlanUseCase(
      planQueryRepository,
      userRepository,
      passwordHasher,
      userQueryRepository,
      systemLogService,
      auditLogService
    );

    await useCase.execute(request);

    expect(planQueryRepository.findByCode).toHaveBeenCalledWith('FREE');
  });

  it('returns unexpected error when created user cannot be reloaded', async () => {
    const planQueryRepository = {
      findByCode: jest.fn().mockResolvedValue({ id: 'plan-1', code: 'FREE' }),
      findById: jest.fn(),
      getPaginatedPlans: jest.fn(),
    };
    const userRepository = {
      exists: jest.fn().mockResolvedValue(false),
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      delete: jest.fn(),
    };
    const passwordHasher = { hash: jest.fn().mockResolvedValue('hashed-password'), compare: jest.fn() };
    const userQueryRepository = {
      findById: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn(),
      findAuthByEmail: jest.fn(),
      getPaginatedUsers: jest.fn(),
      getBasicUsers: jest.fn(),
    };
    const systemLogService = { log: jest.fn() };
    const auditLogService = { log: jest.fn() };

    const useCase = new CreateUserWithPlanUseCase(
      planQueryRepository,
      userRepository,
      passwordHasher,
      userQueryRepository,
      systemLogService,
      auditLogService
    );

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });

  it('returns validation error when hashed password value-object creation fails', async () => {
    const planQueryRepository = {
      findByCode: jest.fn().mockResolvedValue({ id: 'plan-1', code: 'FREE' }),
      findById: jest.fn(),
      getPaginatedPlans: jest.fn(),
    };
    const userRepository = {
      exists: jest.fn().mockResolvedValue(false),
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      delete: jest.fn(),
    };
    const passwordHasher = { hash: jest.fn().mockResolvedValue('hashed-password'), compare: jest.fn() };
    const userQueryRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAuthByEmail: jest.fn(),
      getPaginatedUsers: jest.fn(),
      getBasicUsers: jest.fn(),
    };
    const systemLogService = { log: jest.fn() };
    const auditLogService = { log: jest.fn() };

    const originalCreate = UserPassword.create;
    const passwordSpy = jest
      .spyOn(UserPassword, 'create')
      .mockImplementation((password: string, isHashed: boolean = false) => {
        if (isHashed) {
          return Result.fail('Invalid hashed password');
        }
        return originalCreate(password, isHashed);
      });

    const useCase = new CreateUserWithPlanUseCase(
      planQueryRepository,
      userRepository,
      passwordHasher,
      userQueryRepository,
      systemLogService,
      auditLogService
    );

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ValidationError);
    passwordSpy.mockRestore();
  });

  it('returns validation error when user aggregate registration fails', async () => {
    const planQueryRepository = {
      findByCode: jest.fn().mockResolvedValue({ id: 'plan-1', code: 'FREE' }),
      findById: jest.fn(),
      getPaginatedPlans: jest.fn(),
    };
    const userRepository = {
      exists: jest.fn().mockResolvedValue(false),
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      delete: jest.fn(),
    };
    const passwordHasher = { hash: jest.fn().mockResolvedValue('hashed-password'), compare: jest.fn() };
    const userQueryRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAuthByEmail: jest.fn(),
      getPaginatedUsers: jest.fn(),
      getBasicUsers: jest.fn(),
    };
    const systemLogService = { log: jest.fn() };
    const auditLogService = { log: jest.fn() };

    const registerSpy = jest
      .spyOn(User, 'register')
      .mockImplementationOnce(() => Result.fail('Invalid user aggregate'));

    const useCase = new CreateUserWithPlanUseCase(
      planQueryRepository,
      userRepository,
      passwordHasher,
      userQueryRepository,
      systemLogService,
      auditLogService
    );

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ValidationError);
    registerSpy.mockRestore();
  });
});
