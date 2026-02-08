import { DeletePlanRequestDto } from './delete-plan.dto';

import { NotFoundError, UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { IPlanCommandRepository } from '@/modules/plan/application/repositories/plan.command.repository.interface';
import {
  IPlanQueryRepository,
  PlanDto,
} from '@/modules/plan/application/repositories/plan.query.repository.interface';

type DeletePlanResponse = Result<PlanDto, NotFoundError | UnexpectedError>;

export class DeletePlanUseCase implements UseCase<DeletePlanRequestDto, DeletePlanResponse> {
  constructor(
    private readonly planCommandRepository: IPlanCommandRepository,
    private readonly planQueryRepository: IPlanQueryRepository
  ) {}

  public async execute(request: DeletePlanRequestDto): Promise<DeletePlanResponse> {
    try {
      const existing = await this.planQueryRepository.findById(request.planId);

      if (!existing) {
        return Result.fail(new NotFoundError('Plan not found'));
      }

      const plan = await this.planCommandRepository.delete(request.planId);
      return Result.ok(plan);
    } catch (err) {
      return Result.fail(new UnexpectedError(err));
    }
  }
}
