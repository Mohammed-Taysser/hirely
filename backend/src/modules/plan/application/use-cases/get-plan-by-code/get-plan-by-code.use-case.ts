import { GetPlanByCodeRequestDto } from './get-plan-by-code.dto';

import { NotFoundError, UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { IPlanQueryRepository } from '@/modules/plan/application/repositories/plan.query.repository.interface';

type GetPlanByCodeResponse = Result<NonNullable<Awaited<ReturnType<IPlanQueryRepository['findByCode']>>>, NotFoundError | UnexpectedError>;

export class GetPlanByCodeUseCase
  implements UseCase<GetPlanByCodeRequestDto, GetPlanByCodeResponse>
{
  constructor(private readonly planQueryRepository: IPlanQueryRepository) {}

  public async execute(request: GetPlanByCodeRequestDto): Promise<GetPlanByCodeResponse> {
    try {
      const plan = await this.planQueryRepository.findByCode(request.code);

      if (!plan) {
        return Result.fail(new NotFoundError('Plan not found'));
      }

      return Result.ok(plan);
    } catch (err) {
      return Result.fail(new UnexpectedError(err));
    }
  }
}
