import { ChangeUserPlanRequestDto } from './change-user-plan.dto';

import { AuditActions } from '@/modules/audit/application/audit.actions';
import { buildAuditEntity } from '@/modules/audit/application/audit.entity';
import { IAuditLogService } from '@/modules/audit/application/services/audit-log.service.interface';
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
    private readonly systemLogService: ISystemLogService,
    private readonly auditLogService: IAuditLogService
  ) {}

  public async execute(request: ChangeUserPlanRequestDto): Promise<ChangeUserPlanResponse> {
    if (!request.planCode?.trim()) {
      return Result.fail(new ValidationError('Plan code is required'));
    }

    let scheduledAt: Date | null = null;
    if (request.scheduleAt) {
      const parsed = new Date(request.scheduleAt);
      if (Number.isNaN(parsed.getTime())) {
        return Result.fail(new ValidationError('scheduleAt must be a valid ISO date'));
      }
      scheduledAt = parsed;
    }

    try {
      const plan = await this.planQueryRepository.findByCode(request.planCode.trim());
      if (!plan) {
        return Result.fail(new NotFoundError('Plan not found'));
      }

      const user = await this.userRepository.findById(request.userId);
      if (!user) {
        return Result.fail(new NotFoundError('User not found'));
      }

      if (scheduledAt && scheduledAt.getTime() > Date.now()) {
        user.schedulePlanChange(plan.id, scheduledAt);
      } else {
        user.changePlan(plan.id);
      }
      await this.userRepository.save(user);

      const updated = await this.userQueryRepository.findById(user.id);
      if (!updated) {
        return Result.fail(new NotFoundError('User not found'));
      }

      await this.systemLogService.log({
        level: 'info',
        action: scheduledAt ? SystemActions.USER_PLAN_SCHEDULED : SystemActions.USER_PLAN_CHANGED,
        userId: user.id,
        metadata: {
          planId: plan.id,
          planCode: plan.code,
          scheduleAt: scheduledAt?.toISOString() ?? null,
        },
      });

      await this.auditLogService.log({
        action: scheduledAt ? AuditActions.USER_PLAN_SCHEDULED : AuditActions.USER_PLAN_CHANGED,
        actorUserId: user.id,
        ...buildAuditEntity('user', user.id),
        metadata: {
          planId: plan.id,
          planCode: plan.code,
          scheduleAt: scheduledAt?.toISOString() ?? null,
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
