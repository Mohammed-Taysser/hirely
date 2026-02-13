import { UpdatePlanRequestDto } from './update-plan.dto';

import { AuditActions } from '@/modules/audit/application/audit.actions';
import { buildAuditEntity } from '@/modules/audit/application/audit.entity';
import { IAuditLogService } from '@/modules/audit/application/services/audit-log.service.interface';
import { IPlanCommandRepository } from '@/modules/plan/application/repositories/plan.command.repository.interface';
import {
  IPlanQueryRepository,
  PlanDto,
} from '@/modules/plan/application/repositories/plan.query.repository.interface';
import { NotFoundError, UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { ISystemLogService } from '@/modules/system/application/services/system-log.service.interface';
import { SystemActions } from '@/modules/system/application/system.actions';

type UpdatePlanResponse = Result<PlanDto, NotFoundError | UnexpectedError>;

export class UpdatePlanUseCase implements UseCase<UpdatePlanRequestDto, UpdatePlanResponse> {
  constructor(
    private readonly planCommandRepository: IPlanCommandRepository,
    private readonly planQueryRepository: IPlanQueryRepository,
    private readonly systemLogService: ISystemLogService,
    private readonly auditLogService: IAuditLogService
  ) {}

  public async execute(request: UpdatePlanRequestDto): Promise<UpdatePlanResponse> {
    try {
      const existing = await this.planQueryRepository.findById(request.planId);

      if (!existing) {
        return Result.fail(new NotFoundError('Plan not found'));
      }

      const plan = await this.planCommandRepository.update(request.planId, request.data);

      await this.systemLogService.log({
        level: 'info',
        action: SystemActions.PLAN_UPDATED,
        metadata: {
          planId: plan.id,
          updatedFields: Object.keys(request.data ?? {}),
        },
      });

      await this.auditLogService.log({
        action: AuditActions.PLAN_UPDATED,
        ...buildAuditEntity('plan', plan.id),
        metadata: {
          updatedFields: Object.keys(request.data ?? {}),
        },
      });

      return Result.ok(plan);
    } catch (err) {
      await this.systemLogService.log({
        level: 'error',
        action: SystemActions.PLAN_UPDATE_FAILED,
        metadata: { planId: request.planId },
        message: err instanceof Error ? err.message : 'Unknown error',
      });
      return Result.fail(new UnexpectedError(err));
    }
  }
}
