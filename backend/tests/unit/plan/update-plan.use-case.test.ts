import { UpdatePlanUseCase } from '@dist/modules/plan/application/use-cases/update-plan/update-plan.use-case';
import {
  NotFoundError,
  UnexpectedError,
} from '@dist/modules/shared/application/app-error';

describe('UpdatePlanUseCase', () => {
  it('returns not found when target plan does not exist', async () => {
    const planCommandRepository = { create: jest.fn(), update: jest.fn(), delete: jest.fn() };
    const planQueryRepository = {
      findById: jest.fn().mockResolvedValue(null),
      findByCode: jest.fn(),
      getPaginatedPlans: jest.fn(),
    };
    const systemLogService = { log: jest.fn() };
    const auditLogService = { log: jest.fn() };

    const useCase = new UpdatePlanUseCase(
      planCommandRepository,
      planQueryRepository,
      systemLogService,
      auditLogService
    );

    const result = await useCase.execute({ planId: 'missing', data: { name: 'Updated' } });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
  });

  it('updates plan when it exists', async () => {
    const existing = { id: 'plan-1', code: 'pro', name: 'Pro' };
    const updated = { id: 'plan-1', code: 'pro', name: 'Pro Updated' };

    const planCommandRepository = {
      create: jest.fn(),
      update: jest.fn().mockResolvedValue(updated),
      delete: jest.fn(),
    };
    const planQueryRepository = {
      findById: jest.fn().mockResolvedValue(existing),
      findByCode: jest.fn(),
      getPaginatedPlans: jest.fn(),
    };
    const systemLogService = { log: jest.fn() };
    const auditLogService = { log: jest.fn() };

    const useCase = new UpdatePlanUseCase(
      planCommandRepository,
      planQueryRepository,
      systemLogService,
      auditLogService
    );

    const result = await useCase.execute({ planId: 'plan-1', data: { name: 'Pro Updated' } });

    expect(result.isSuccess).toBe(true);
    expect(planCommandRepository.update).toHaveBeenCalledWith('plan-1', { name: 'Pro Updated' });
    expect(systemLogService.log).toHaveBeenCalled();
    expect(auditLogService.log).toHaveBeenCalled();
  });

  it('returns unexpected error when update fails', async () => {
    const existing = { id: 'plan-1', code: 'pro', name: 'Pro' };
    const planCommandRepository = {
      create: jest.fn(),
      update: jest.fn().mockRejectedValue(new Error('db failed')),
      delete: jest.fn(),
    };
    const planQueryRepository = {
      findById: jest.fn().mockResolvedValue(existing),
      findByCode: jest.fn(),
      getPaginatedPlans: jest.fn(),
    };
    const systemLogService = { log: jest.fn() };
    const auditLogService = { log: jest.fn() };

    const useCase = new UpdatePlanUseCase(
      planCommandRepository,
      planQueryRepository,
      systemLogService,
      auditLogService
    );

    const result = await useCase.execute({ planId: 'plan-1', data: { name: 'Updated' } });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
    expect(systemLogService.log).toHaveBeenCalled();
  });

  it('logs empty updatedFields when request data is undefined', async () => {
    const existing = { id: 'plan-1', code: 'pro', name: 'Pro' };
    const updated = { id: 'plan-1', code: 'pro', name: 'Pro' };

    const planCommandRepository = {
      create: jest.fn(),
      update: jest.fn().mockResolvedValue(updated),
      delete: jest.fn(),
    };
    const planQueryRepository = {
      findById: jest.fn().mockResolvedValue(existing),
      findByCode: jest.fn(),
      getPaginatedPlans: jest.fn(),
    };
    const systemLogService = { log: jest.fn() };
    const auditLogService = { log: jest.fn() };

    const useCase = new UpdatePlanUseCase(
      planCommandRepository,
      planQueryRepository,
      systemLogService,
      auditLogService
    );

    const result = await useCase.execute({
      planId: 'plan-1',
      data: undefined as unknown as { name?: string },
    });

    expect(result.isSuccess).toBe(true);
    expect(systemLogService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: { planId: 'plan-1', updatedFields: [] },
      })
    );
    expect(auditLogService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: { updatedFields: [] },
      })
    );
  });

  it('uses unknown-error fallback when update throws non-error', async () => {
    const existing = { id: 'plan-1', code: 'pro', name: 'Pro' };
    const planCommandRepository = {
      create: jest.fn(),
      update: jest.fn().mockRejectedValue('db failed'),
      delete: jest.fn(),
    };
    const planQueryRepository = {
      findById: jest.fn().mockResolvedValue(existing),
      findByCode: jest.fn(),
      getPaginatedPlans: jest.fn(),
    };
    const systemLogService = { log: jest.fn() };
    const auditLogService = { log: jest.fn() };

    const useCase = new UpdatePlanUseCase(
      planCommandRepository,
      planQueryRepository,
      systemLogService,
      auditLogService
    );

    const result = await useCase.execute({ planId: 'plan-1', data: { name: 'Updated' } });

    expect(result.isFailure).toBe(true);
    expect(systemLogService.log).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Unknown error' })
    );
  });
});
