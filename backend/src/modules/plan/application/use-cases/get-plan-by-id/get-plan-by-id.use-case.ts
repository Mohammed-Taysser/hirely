import { GetPlanByIdRequestDto } from './get-plan-by-id.dto';

import { NotFoundError, UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { IPlanQueryRepository, PlanDto } from '@/modules/plan/application/repositories/plan.query.repository.interface';

type GetPlanByIdResponse = Result<PlanDto, NotFoundError | UnexpectedError>;

export class GetPlanByIdUseCase implements UseCase<GetPlanByIdRequestDto, GetPlanByIdResponse> {
  constructor(private readonly planQueryRepository: IPlanQueryRepository) {}

  public async execute(request: GetPlanByIdRequestDto): Promise<GetPlanByIdResponse> {
    try {
      const plan = await this.planQueryRepository.findById(request.planId);

      if (!plan) {
        return Result.fail(new NotFoundError('Plan not found'));
      }

      return Result.ok(plan);
    } catch (err) {
      return Result.fail(new UnexpectedError(err));
    }
  }
}
