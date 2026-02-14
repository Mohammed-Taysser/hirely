import { ChangeUserPlanUseCase } from '@dist/modules/user/application/use-cases/change-user-plan/change-user-plan.use-case';
import {
  NotFoundError,
  UnexpectedError,
  ValidationError,
} from '@dist/modules/shared/application/app-error';

describe('ChangeUserPlanUseCase', () => {
  const makeDeps = () => {
    const userAggregate = {
      id: 'user-1',
      changePlan: jest.fn(),
      schedulePlanChange: jest.fn(),
    };

    return {
      userAggregate,
      userRepository: {
        exists: jest.fn(),
        save: jest.fn(),
        findById: jest.fn().mockResolvedValue(userAggregate),
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
      planQueryRepository: {
        findByCode: jest.fn().mockResolvedValue({ id: 'plan-2', code: 'PRO' }),
        findById: jest.fn(),
        getPaginatedPlans: jest.fn(),
      },
      billingService: {
        enforceDailyUploadLimit: jest.fn(),
        resolvePlanChangeSchedule: jest.fn().mockResolvedValue({
          effectiveAt: null,
          reason: 'immediate',
        }),
      },
      systemLogService: { log: jest.fn() },
      auditLogService: { log: jest.fn() },
    };
  };

  it('validates planCode presence', async () => {
    const d = makeDeps();
    const useCase = new ChangeUserPlanUseCase(
      d.userRepository,
      d.userQueryRepository,
      d.planQueryRepository,
      d.billingService,
      d.systemLogService,
      d.auditLogService
    );

    const result = await useCase.execute({ userId: 'user-1', planCode: '' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ValidationError);
  });

  it('changes plan immediately when scheduleAt is not provided', async () => {
    const d = makeDeps();
    const useCase = new ChangeUserPlanUseCase(
      d.userRepository,
      d.userQueryRepository,
      d.planQueryRepository,
      d.billingService,
      d.systemLogService,
      d.auditLogService
    );

    const result = await useCase.execute({ userId: 'user-1', planCode: 'PRO' });

    expect(result.isSuccess).toBe(true);
    expect(d.userAggregate.changePlan).toHaveBeenCalledWith('plan-2');
    expect(d.userAggregate.schedulePlanChange).not.toHaveBeenCalled();
  });

  it('changes plan immediately when scheduleAt is in the past', async () => {
    const d = makeDeps();
    const useCase = new ChangeUserPlanUseCase(
      d.userRepository,
      d.userQueryRepository,
      d.planQueryRepository,
      d.billingService,
      d.systemLogService,
      d.auditLogService
    );

    const scheduleAt = new Date(Date.now() - 3600_000).toISOString();
    const result = await useCase.execute({ userId: 'user-1', planCode: 'PRO', scheduleAt });

    expect(result.isSuccess).toBe(true);
    expect(d.userAggregate.changePlan).toHaveBeenCalledWith('plan-2');
    expect(d.userAggregate.schedulePlanChange).not.toHaveBeenCalled();
  });

  it('schedules plan for future date', async () => {
    const d = makeDeps();
    const effectiveAt = new Date(Date.now() + 3600_000);
    d.billingService.resolvePlanChangeSchedule.mockResolvedValueOnce({
      effectiveAt,
      reason: 'requested',
    });

    const useCase = new ChangeUserPlanUseCase(
      d.userRepository,
      d.userQueryRepository,
      d.planQueryRepository,
      d.billingService,
      d.systemLogService,
      d.auditLogService
    );

    const scheduleAt = effectiveAt.toISOString();
    const result = await useCase.execute({ userId: 'user-1', planCode: 'PRO', scheduleAt });

    expect(result.isSuccess).toBe(true);
    expect(d.userAggregate.schedulePlanChange).toHaveBeenCalledWith('plan-2', effectiveAt);
    expect(d.userAggregate.changePlan).not.toHaveBeenCalled();
  });

  it('returns not found when plan is missing', async () => {
    const d = makeDeps();
    d.planQueryRepository.findByCode.mockResolvedValue(null);

    const useCase = new ChangeUserPlanUseCase(
      d.userRepository,
      d.userQueryRepository,
      d.planQueryRepository,
      d.billingService,
      d.systemLogService,
      d.auditLogService
    );

    const result = await useCase.execute({ userId: 'user-1', planCode: 'MISSING' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
  });

  it('returns validation error when scheduleAt is invalid', async () => {
    const d = makeDeps();
    const useCase = new ChangeUserPlanUseCase(
      d.userRepository,
      d.userQueryRepository,
      d.planQueryRepository,
      d.billingService,
      d.systemLogService,
      d.auditLogService
    );

    const result = await useCase.execute({
      userId: 'user-1',
      planCode: 'PRO',
      scheduleAt: 'not-a-date',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ValidationError);
  });

  it('returns not found when user is missing', async () => {
    const d = makeDeps();
    d.userRepository.findById.mockResolvedValue(null);

    const useCase = new ChangeUserPlanUseCase(
      d.userRepository,
      d.userQueryRepository,
      d.planQueryRepository,
      d.billingService,
      d.systemLogService,
      d.auditLogService
    );

    const result = await useCase.execute({ userId: 'user-1', planCode: 'PRO' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
  });

  it('returns not found when updated user cannot be loaded', async () => {
    const d = makeDeps();
    d.userQueryRepository.findById.mockResolvedValue(null);

    const useCase = new ChangeUserPlanUseCase(
      d.userRepository,
      d.userQueryRepository,
      d.planQueryRepository,
      d.billingService,
      d.systemLogService,
      d.auditLogService
    );

    const result = await useCase.execute({ userId: 'user-1', planCode: 'PRO' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
  });

  it('returns unexpected error on exception', async () => {
    const d = makeDeps();
    d.planQueryRepository.findByCode.mockRejectedValue(new Error('db failed'));

    const useCase = new ChangeUserPlanUseCase(
      d.userRepository,
      d.userQueryRepository,
      d.planQueryRepository,
      d.billingService,
      d.systemLogService,
      d.auditLogService
    );

    const result = await useCase.execute({ userId: 'user-1', planCode: 'PRO' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });

  it('logs Unknown error message when thrown value is not Error', async () => {
    const d = makeDeps();
    d.planQueryRepository.findByCode.mockRejectedValue('db failed');

    const useCase = new ChangeUserPlanUseCase(
      d.userRepository,
      d.userQueryRepository,
      d.planQueryRepository,
      d.billingService,
      d.systemLogService,
      d.auditLogService
    );

    const result = await useCase.execute({ userId: 'user-1', planCode: 'PRO' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
    expect(d.systemLogService.log).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Unknown error' })
    );
  });

  it('schedules downgrade at billing cycle end when no explicit scheduleAt is provided', async () => {
    const d = makeDeps();
    const future = new Date(Date.now() + 60 * 60 * 1000);
    d.billingService.resolvePlanChangeSchedule.mockResolvedValue({
      effectiveAt: future,
      reason: 'billing-cycle',
    });

    const useCase = new ChangeUserPlanUseCase(
      d.userRepository,
      d.userQueryRepository,
      d.planQueryRepository,
      d.billingService,
      d.systemLogService,
      d.auditLogService
    );

    const result = await useCase.execute({ userId: 'user-1', planCode: 'PRO' });

    expect(result.isSuccess).toBe(true);
    expect(d.userAggregate.schedulePlanChange).toHaveBeenCalledWith('plan-2', future);
    expect(d.userAggregate.changePlan).not.toHaveBeenCalled();
  });
});
