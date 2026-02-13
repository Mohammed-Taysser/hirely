import { ApplyScheduledPlanChangesRequestDto } from './apply-scheduled-plan-changes.dto';

import { UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import {
  AppliedUserPlanChange,
  IUserPlanChangeRepository,
} from '@/modules/user/application/repositories/user-plan-change.repository.interface';

type ApplyScheduledPlanChangesResponse = Result<AppliedUserPlanChange[], UnexpectedError>;

export class ApplyScheduledPlanChangesUseCase implements UseCase<
  ApplyScheduledPlanChangesRequestDto,
  ApplyScheduledPlanChangesResponse
> {
  constructor(private readonly userPlanChangeRepository: IUserPlanChangeRepository) {}

  async execute(
    request: ApplyScheduledPlanChangesRequestDto = {}
  ): Promise<ApplyScheduledPlanChangesResponse> {
    try {
      const applied = await this.userPlanChangeRepository.applyScheduledPlanChanges(
        request.now ?? new Date()
      );
      return Result.ok(applied);
    } catch (error) {
      return Result.fail(new UnexpectedError(error));
    }
  }
}
