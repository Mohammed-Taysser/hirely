import { ChangeUserPlanRequestDto } from './change-user-plan.dto';

import { AuditActions } from '@/modules/audit/application/audit.actions';
import { buildAuditEntity } from '@/modules/audit/application/audit.entity';
import { IAuditLogService } from '@/modules/audit/application/services/audit-log.service.interface';
import { IBillingService } from '@/modules/billing/application/services/billing.service.interface';
import { IPlanQueryRepository } from '@/modules/plan/application/repositories/plan.query.repository.interface';
import {
  NotFoundError,
  UnexpectedError,
  ValidationError,
} from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { ISystemLogService } from '@/modules/system/application/services/system-log.service.interface';
import { SystemActions } from '@/modules/system/application/system.actions';
import {
  IUserQueryRepository,
  UserFullDto,
} from '@/modules/user/application/repositories/user.query.repository.interface';
import { IUserRepository } from '@/modules/user/domain/repositories/user.repository.interface';

export type ChangeUserPlanResponse = Result<
  UserFullDto,
  ValidationError | NotFoundError | UnexpectedError
>;

export class ChangeUserPlanUseCase implements UseCase<
  ChangeUserPlanRequestDto,
  ChangeUserPlanResponse
> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userQueryRepository: IUserQueryRepository,
    private readonly planQueryRepository: IPlanQueryRepository,
    private readonly billingService: IBillingService,
    private readonly systemLogService: ISystemLogService,
    private readonly auditLogService: IAuditLogService
  ) {}

  private parseRequestedScheduleAt(scheduleAt?: string): Result<Date | null, ValidationError> {
    if (!scheduleAt) {
      return Result.ok(null);
    }

    const parsed = new Date(scheduleAt);
    if (Number.isNaN(parsed.getTime())) {
      return Result.fail(new ValidationError('scheduleAt must be a valid ISO date'));
    }

    return Result.ok(parsed);
  }

  private isFuture(date: Date | null): date is Date {
    return date !== null && date.getTime() > Date.now();
  }

  private resolvePlanChangeActions(effectiveAt: Date | null): {
    systemAction: (typeof SystemActions)[keyof typeof SystemActions];
    auditAction: (typeof AuditActions)[keyof typeof AuditActions];
  } {
    if (this.isFuture(effectiveAt)) {
      return {
        systemAction: SystemActions.USER_PLAN_SCHEDULED,
        auditAction: AuditActions.USER_PLAN_SCHEDULED,
      };
    }

    return {
      systemAction: SystemActions.USER_PLAN_CHANGED,
      auditAction: AuditActions.USER_PLAN_CHANGED,
    };
  }

  public async execute(request: ChangeUserPlanRequestDto): Promise<ChangeUserPlanResponse> {
    if (!request.planCode?.trim()) {
      return Result.fail(new ValidationError('Plan code is required'));
    }

    const requestedScheduleAtResult = this.parseRequestedScheduleAt(request.scheduleAt);
    if (requestedScheduleAtResult.isFailure) {
      return Result.fail(
        requestedScheduleAtResult.error ??
          new ValidationError('scheduleAt must be a valid ISO date')
      );
    }
    const requestedScheduleAt = requestedScheduleAtResult.getValue();

    try {
      const plan = await this.planQueryRepository.findByCode(request.planCode.trim());
      if (!plan) {
        return Result.fail(new NotFoundError('Plan not found'));
      }

      const user = await this.userRepository.findById(request.userId);
      if (!user) {
        return Result.fail(new NotFoundError('User not found'));
      }

      const scheduleResolution = await this.billingService.resolvePlanChangeSchedule({
        userId: user.id,
        currentPlanId: user.planId,
        targetPlanId: plan.id,
        requestedScheduleAt,
      });

      const effectiveAt = scheduleResolution.effectiveAt;
      if (this.isFuture(effectiveAt)) {
        user.schedulePlanChange(plan.id, effectiveAt);
      } else {
        user.changePlan(plan.id);
      }
      await this.userRepository.save(user);

      const updated = await this.userQueryRepository.findById(user.id);
      if (!updated) {
        return Result.fail(new NotFoundError('User not found'));
      }

      const { systemAction, auditAction } = this.resolvePlanChangeActions(effectiveAt);
      await this.systemLogService.log({
        level: 'info',
        action: systemAction,
        userId: user.id,
        metadata: {
          planId: plan.id,
          planCode: plan.code,
          scheduleAt: effectiveAt?.toISOString() ?? null,
          scheduleReason: scheduleResolution.reason,
        },
      });

      await this.auditLogService.log({
        action: auditAction,
        actorUserId: user.id,
        ...buildAuditEntity('user', user.id),
        metadata: {
          planId: plan.id,
          planCode: plan.code,
          scheduleAt: effectiveAt?.toISOString() ?? null,
          scheduleReason: scheduleResolution.reason,
        },
      });

      return Result.ok(updated);
    } catch (err) {
      await this.systemLogService.log({
        level: 'error',
        action: SystemActions.USER_PLAN_CHANGE_FAILED,
        userId: request.userId,
        message: err instanceof Error ? err.message : 'Unknown error',
      });
      return Result.fail(new UnexpectedError(err));
    }
  }
}
