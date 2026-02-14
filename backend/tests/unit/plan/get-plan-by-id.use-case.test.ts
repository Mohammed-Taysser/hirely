import { GetPlanByIdUseCase } from '@dist/modules/plan/application/use-cases/get-plan-by-id/get-plan-by-id.use-case';
import {
  NotFoundError,
  UnexpectedError,
} from '@dist/modules/shared/application/app-error';

describe('GetPlanByIdUseCase', () => {
  it('returns plan when found', async () => {
    const planQueryRepository = {
      findById: jest.fn().mockResolvedValue({ id: 'plan-1', code: 'pro', name: 'Pro' }),
      findByCode: jest.fn(),
      getPaginatedPlans: jest.fn(),
    };

    const useCase = new GetPlanByIdUseCase(planQueryRepository);
    const result = await useCase.execute({ planId: 'plan-1' });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().id).toBe('plan-1');
  });

  it('returns not found when plan does not exist', async () => {
    const planQueryRepository = {
      findById: jest.fn().mockResolvedValue(null),
      findByCode: jest.fn(),
      getPaginatedPlans: jest.fn(),
    };

    const useCase = new GetPlanByIdUseCase(planQueryRepository);
    const result = await useCase.execute({ planId: 'missing' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
  });

  it('returns unexpected error when repository throws', async () => {
    const planQueryRepository = {
      findById: jest.fn().mockRejectedValue(new Error('db failed')),
      findByCode: jest.fn(),
      getPaginatedPlans: jest.fn(),
    };

    const useCase = new GetPlanByIdUseCase(planQueryRepository);
    const result = await useCase.execute({ planId: 'plan-1' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });
});
