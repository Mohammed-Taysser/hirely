import { UnexpectedError } from '@dist/modules/shared/application/app-error';
import { ApplyScheduledPlanChangesUseCase } from '@dist/modules/user/application/use-cases/apply-scheduled-plan-changes/apply-scheduled-plan-changes.use-case';

describe('ApplyScheduledPlanChangesUseCase', () => {
  it('applies scheduled changes using provided date', async () => {
    const now = new Date('2026-02-14T10:00:00.000Z');
    const userPlanChangeRepository = {
      applyScheduledPlanChanges: jest
        .fn()
        .mockResolvedValue([{ userId: 'user-1', fromPlanId: 'free', toPlanId: 'pro' }]),
    };

    const useCase = new ApplyScheduledPlanChangesUseCase(userPlanChangeRepository);
    const result = await useCase.execute({ now });

    expect(result.isSuccess).toBe(true);
    expect(userPlanChangeRepository.applyScheduledPlanChanges).toHaveBeenCalledWith(now);
    expect(result.getValue()).toHaveLength(1);
  });

  it('uses current date when now is not provided', async () => {
    const userPlanChangeRepository = {
      applyScheduledPlanChanges: jest.fn().mockResolvedValue([]),
    };

    const useCase = new ApplyScheduledPlanChangesUseCase(userPlanChangeRepository);
    const result = await useCase.execute();

    expect(result.isSuccess).toBe(true);
    expect(userPlanChangeRepository.applyScheduledPlanChanges).toHaveBeenCalledTimes(1);
    const calledWith = userPlanChangeRepository.applyScheduledPlanChanges.mock.calls[0][0];
    expect(calledWith).toBeInstanceOf(Date);
  });

  it('returns unexpected error when repository throws', async () => {
    const userPlanChangeRepository = {
      applyScheduledPlanChanges: jest.fn().mockRejectedValue(new Error('db failed')),
    };

    const useCase = new ApplyScheduledPlanChangesUseCase(userPlanChangeRepository);
    const result = await useCase.execute();

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });
});
