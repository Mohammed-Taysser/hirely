import { CreatePlanRequestDto } from './create-plan.dto';

import { ConflictError, UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { IPlanCommandRepository } from '@/modules/plan/application/repositories/plan.command.repository.interface';
import { IPlanQueryRepository, PlanDto } from '@/modules/plan/application/repositories/plan.query.repository.interface';

type CreatePlanResponse = Result<PlanDto, ConflictError | UnexpectedError>;

export class CreatePlanUseCase implements UseCase<CreatePlanRequestDto, CreatePlanResponse> {
  constructor(
    private readonly planCommandRepository: IPlanCommandRepository,
    private readonly planQueryRepository: IPlanQueryRepository
  ) {}

  public async execute(request: CreatePlanRequestDto): Promise<CreatePlanResponse> {
    try {
      const existing = await this.planQueryRepository.findByCode(request.code);

      if (existing) {
        return Result.fail(new ConflictError('Plan code already exists'));
      }

      const plan = await this.planCommandRepository.create(request);
      return Result.ok(plan);
    } catch (err) {
      return Result.fail(new UnexpectedError(err));
    }
  }
}
