import { CreatePlanUseCase } from '@dist/modules/plan/application/use-cases/create-plan/create-plan.use-case';
import {
  ConflictError,
  UnexpectedError,
} from '@dist/modules/shared/application/app-error';

describe('CreatePlanUseCase', () => {
  it('returns conflict when plan code already exists', async () => {
    const planCommandRepository = { create: jest.fn(), update: jest.fn(), delete: jest.fn() };
    const planQueryRepository = {
      findByCode: jest.fn().mockResolvedValue({ id: 'plan-1', code: 'pro' }),
      findById: jest.fn(),
      getPaginatedPlans: jest.fn(),
    };
    const systemLogService = { log: jest.fn() };
    const auditLogService = { log: jest.fn() };

    const useCase = new CreatePlanUseCase(
      planCommandRepository,
      planQueryRepository,
      systemLogService,
      auditLogService
    );

    const result = await useCase.execute({
      code: 'pro',
      name: 'Pro',
      description: 'desc',
      limits: { maxResumes: 10, maxExports: 10, dailyUploadMb: 100 },
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ConflictError);
    expect(planCommandRepository.create).not.toHaveBeenCalled();
  });

  it('creates plan and writes logs', async () => {
    const planCommandRepository = {
      create: jest.fn().mockResolvedValue({ id: 'plan-1', code: 'pro', name: 'Pro' }),
      update: jest.fn(),
      delete: jest.fn(),
    };
    const planQueryRepository = {
      findByCode: jest.fn().mockResolvedValue(null),
      findById: jest.fn(),
      getPaginatedPlans: jest.fn(),
    };
    const systemLogService = { log: jest.fn() };
    const auditLogService = { log: jest.fn() };

    const useCase = new CreatePlanUseCase(
      planCommandRepository,
      planQueryRepository,
      systemLogService,
      auditLogService
    );

    const result = await useCase.execute({
      code: 'pro',
      name: 'Pro',
      description: 'desc',
      limits: { maxResumes: 10, maxExports: 10, dailyUploadMb: 100 },
    });

    expect(result.isSuccess).toBe(true);
    expect(planCommandRepository.create).toHaveBeenCalledTimes(1);
    expect(systemLogService.log).toHaveBeenCalled();
    expect(auditLogService.log).toHaveBeenCalled();
  });

  it('returns unexpected error on repository exception', async () => {
    const planCommandRepository = {
      create: jest.fn().mockRejectedValue(new Error('db failed')),
      update: jest.fn(),
      delete: jest.fn(),
    };
    const planQueryRepository = {
      findByCode: jest.fn().mockResolvedValue(null),
      findById: jest.fn(),
      getPaginatedPlans: jest.fn(),
    };
    const systemLogService = { log: jest.fn() };
    const auditLogService = { log: jest.fn() };

    const useCase = new CreatePlanUseCase(
      planCommandRepository,
      planQueryRepository,
      systemLogService,
      auditLogService
    );

    const result = await useCase.execute({
      code: 'pro',
      name: 'Pro',
      description: 'desc',
      limits: { maxResumes: 10, maxExports: 10, dailyUploadMb: 100 },
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
    expect(systemLogService.log).toHaveBeenCalled();
  });

  it('uses unknown-error fallback when non-error is thrown', async () => {
    const planCommandRepository = {
      create: jest.fn().mockRejectedValue('db failed'),
      update: jest.fn(),
      delete: jest.fn(),
    };
    const planQueryRepository = {
      findByCode: jest.fn().mockResolvedValue(null),
      findById: jest.fn(),
      getPaginatedPlans: jest.fn(),
    };
    const systemLogService = { log: jest.fn() };
    const auditLogService = { log: jest.fn() };

    const useCase = new CreatePlanUseCase(
      planCommandRepository,
      planQueryRepository,
      systemLogService,
      auditLogService
    );

    const result = await useCase.execute({
      code: 'pro',
      name: 'Pro',
      description: 'desc',
      limits: { maxResumes: 10, maxExports: 10, dailyUploadMb: 100 },
    });

    expect(result.isFailure).toBe(true);
    expect(systemLogService.log).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Unknown error' })
    );
  });
});
