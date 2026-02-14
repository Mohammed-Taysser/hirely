import {
  GetFailedExportEmailJobsRequestDto,
  GetFailedExportEmailJobsResponseDto,
} from './get-failed-export-email-jobs.dto';

import { UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { ISystemLogQueryRepository } from '@/modules/system/application/repositories/system-log.query.repository.interface';

type GetFailedExportEmailJobsResponse = Result<
  GetFailedExportEmailJobsResponseDto,
  UnexpectedError
>;

export class GetFailedExportEmailJobsUseCase implements UseCase<
  GetFailedExportEmailJobsRequestDto,
  GetFailedExportEmailJobsResponse
> {
  constructor(private readonly systemLogQueryRepository: ISystemLogQueryRepository) {}

  async execute(
    request: GetFailedExportEmailJobsRequestDto
  ): Promise<GetFailedExportEmailJobsResponse> {
    try {
      const result = await this.systemLogQueryRepository.findFailedExportEmailJobs({
        userId: request.userId,
        page: request.page,
        limit: request.limit,
      });

      return Result.ok(result);
    } catch (error) {
      return Result.fail(new UnexpectedError(error));
    }
  }
}
