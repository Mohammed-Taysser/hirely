import { DeletePlanUseCase } from '@dist/modules/plan/application/use-cases/delete-plan/delete-plan.use-case';
import {
  NotFoundError,
  UnexpectedError,
} from '@dist/modules/shared/application/app-error';

describe('DeletePlanUseCase', () => {
  it('returns not found for unknown plan', async () => {
    const planCommandRepository = { create: jest.fn(), update: jest.fn(), delete: jest.fn() };
    const planQueryRepository = {
      findById: jest.fn().mockResolvedValue(null),
      findByCode: jest.fn(),
      getPaginatedPlans: jest.fn(),
    };
    const systemLogService = { log: jest.fn() };
    const auditLogService = { log: jest.fn() };

    const useCase = new DeletePlanUseCase(
      planCommandRepository,
      planQueryRepository,
      systemLogService,
      auditLogService
    );
    const result = await useCase.execute({ planId: 'missing' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
  });

  it('deletes existing plan and returns deleted record', async () => {
    const existing = { id: 'plan-1', code: 'pro', name: 'Pro' };
    const planCommandRepository = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn().mockResolvedValue(existing),
    };
    const planQueryRepository = {
      findById: jest.fn().mockResolvedValue(existing),
      findByCode: jest.fn(),
      getPaginatedPlans: jest.fn(),
    };
    const systemLogService = { log: jest.fn() };
    const auditLogService = { log: jest.fn() };

    const useCase = new DeletePlanUseCase(
      planCommandRepository,
      planQueryRepository,
      systemLogService,
      auditLogService
    );
    const result = await useCase.execute({ planId: 'plan-1' });

    expect(result.isSuccess).toBe(true);
    expect(planCommandRepository.delete).toHaveBeenCalledWith('plan-1');
    expect(systemLogService.log).toHaveBeenCalled();
    expect(auditLogService.log).toHaveBeenCalled();
  });

  it('returns unexpected error when delete fails', async () => {
    const existing = { id: 'plan-1', code: 'pro', name: 'Pro' };
    const planCommandRepository = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn().mockRejectedValue(new Error('db failed')),
    };
    const planQueryRepository = {
      findById: jest.fn().mockResolvedValue(existing),
      findByCode: jest.fn(),
      getPaginatedPlans: jest.fn(),
    };
    const systemLogService = { log: jest.fn() };
    const auditLogService = { log: jest.fn() };

    const useCase = new DeletePlanUseCase(
      planCommandRepository,
      planQueryRepository,
      systemLogService,
      auditLogService
    );
    const result = await useCase.execute({ planId: 'plan-1' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
    expect(systemLogService.log).toHaveBeenCalled();
  });

  it('uses unknown-error fallback when delete throws non-error', async () => {
    const existing = { id: 'plan-1', code: 'pro', name: 'Pro' };
    const planCommandRepository = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn().mockRejectedValue('db failed'),
    };
    const planQueryRepository = {
      findById: jest.fn().mockResolvedValue(existing),
      findByCode: jest.fn(),
      getPaginatedPlans: jest.fn(),
    };
    const systemLogService = { log: jest.fn() };
    const auditLogService = { log: jest.fn() };

    const useCase = new DeletePlanUseCase(
      planCommandRepository,
      planQueryRepository,
      systemLogService,
      auditLogService
    );
    const result = await useCase.execute({ planId: 'plan-1' });

    expect(result.isFailure).toBe(true);
    expect(systemLogService.log).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Unknown error' })
    );
  });
});
