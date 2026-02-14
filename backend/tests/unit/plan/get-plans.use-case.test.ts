import { GetPlansUseCase } from '@dist/modules/plan/application/use-cases/get-plans/get-plans.use-case';
import { UnexpectedError } from '@dist/modules/shared/application/app-error';

describe('GetPlansUseCase', () => {
  it('returns paginated plans', async () => {
    const planQueryRepository = {
      getPaginatedPlans: jest.fn().mockResolvedValue([
        [{ id: 'plan-1', code: 'free', name: 'Free' }],
        1,
      ]),
      findById: jest.fn(),
      findByCode: jest.fn(),
    };

    const useCase = new GetPlansUseCase(planQueryRepository);
    const result = await useCase.execute({ page: 1, limit: 10, filters: {} });

    expect(result.isSuccess).toBe(true);
    expect(planQueryRepository.getPaginatedPlans).toHaveBeenCalledWith(1, 10, {});
    expect(result.getValue().total).toBe(1);
    expect(result.getValue().plans).toHaveLength(1);
  });

  it('returns unexpected error on repository failure', async () => {
    const planQueryRepository = {
      getPaginatedPlans: jest.fn().mockRejectedValue(new Error('db failed')),
      findById: jest.fn(),
      findByCode: jest.fn(),
    };

    const useCase = new GetPlansUseCase(planQueryRepository);
    const result = await useCase.execute({ page: 1, limit: 10, filters: {} });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });
});
