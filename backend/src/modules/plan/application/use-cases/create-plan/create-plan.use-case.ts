import { CreatePlanRequestDto } from './create-plan.dto';

import { AuditActions } from '@/modules/audit/application/audit.actions';
import { buildAuditEntity } from '@/modules/audit/application/audit.entity';
import { IAuditLogService } from '@/modules/audit/application/services/audit-log.service.interface';
import { IPlanCommandRepository } from '@/modules/plan/application/repositories/plan.command.repository.interface';
import {
  IPlanQueryRepository,
  PlanDto,
} from '@/modules/plan/application/repositories/plan.query.repository.interface';
import { ConflictError, UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { ISystemLogService } from '@/modules/system/application/services/system-log.service.interface';
import { SystemActions } from '@/modules/system/application/system.actions';

type CreatePlanResponse = Result<PlanDto, ConflictError | UnexpectedError>;

export class CreatePlanUseCase implements UseCase<CreatePlanRequestDto, CreatePlanResponse> {
  constructor(
    private readonly planCommandRepository: IPlanCommandRepository,
    private readonly planQueryRepository: IPlanQueryRepository,
    private readonly systemLogService: ISystemLogService,
    private readonly auditLogService: IAuditLogService
  ) {}

  public async execute(request: CreatePlanRequestDto): Promise<CreatePlanResponse> {
    try {
      const existing = await this.planQueryRepository.findByCode(request.code);

      if (existing) {
        return Result.fail(new ConflictError('Plan code already exists'));
      }

      const plan = await this.planCommandRepository.create(request);

      await this.systemLogService.log({
        level: 'info',
        action: SystemActions.PLAN_CREATED,
        metadata: { planId: plan.id, code: plan.code },
      });

      await this.auditLogService.log({
        action: AuditActions.PLAN_CREATED,
        ...buildAuditEntity('plan', plan.id),
        metadata: { code: plan.code },
      });

      return Result.ok(plan);
    } catch (err) {
      await this.systemLogService.log({
        level: 'error',
        action: SystemActions.PLAN_CREATE_FAILED,
        message: err instanceof Error ? err.message : 'Unknown error',
      });
      return Result.fail(new UnexpectedError(err));
    }
  }
}
