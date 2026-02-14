import { GetFailedExportsRequestDto, GetFailedExportsResponseDto } from './get-failed-exports.dto';

import { IResumeExportQueryRepository } from '@/modules/resume/application/repositories/resume-export.query.repository.interface';
import { UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';

type GetFailedExportsResponse = Result<GetFailedExportsResponseDto, UnexpectedError>;

export class GetFailedExportsUseCase implements UseCase<
  GetFailedExportsRequestDto,
  GetFailedExportsResponse
> {
  constructor(private readonly resumeExportQueryRepository: IResumeExportQueryRepository) {}

  async execute(request: GetFailedExportsRequestDto): Promise<GetFailedExportsResponse> {
    try {
      const [exports, total] = await this.resumeExportQueryRepository.getFailedExportsByUser(
        request.userId,
        request.page,
        request.limit
      );

      return Result.ok({ exports, total });
    } catch (error) {
      return Result.fail(new UnexpectedError(error));
    }
  }
}
