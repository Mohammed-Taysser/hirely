import { GetPlansRequestDto, GetPlansResponseDto } from './get-plans.dto';

import { UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { IPlanQueryRepository } from '@/modules/plan/application/repositories/plan.query.repository.interface';

type GetPlansResponse = Result<GetPlansResponseDto, UnexpectedError>;

export class GetPlansUseCase implements UseCase<GetPlansRequestDto, GetPlansResponse> {
  constructor(private readonly planQueryRepository: IPlanQueryRepository) {}

  public async execute(request: GetPlansRequestDto): Promise<GetPlansResponse> {
    try {
      const [plans, total] = await this.planQueryRepository.getPaginatedPlans(
        request.page,
        request.limit,
        request.filters
      );

      return Result.ok({ plans, total });
    } catch (err) {
      return Result.fail(new UnexpectedError(err));
    }
  }
}
