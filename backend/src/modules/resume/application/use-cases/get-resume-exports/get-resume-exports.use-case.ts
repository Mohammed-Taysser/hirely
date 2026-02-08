import { GetResumeExportsRequestDto, GetResumeExportsResponseDto } from './get-resume-exports.dto';

import { UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { IResumeExportQueryRepository } from '@/modules/resume/application/repositories/resume-export.query.repository.interface';

type GetResumeExportsResponse = Result<GetResumeExportsResponseDto, UnexpectedError>;

export class GetResumeExportsUseCase implements UseCase<
  GetResumeExportsRequestDto,
  GetResumeExportsResponse
> {
  constructor(private readonly resumeExportQueryRepository: IResumeExportQueryRepository) {}

  public async execute(request: GetResumeExportsRequestDto): Promise<GetResumeExportsResponse> {
    try {
      const [exports, total] = await this.resumeExportQueryRepository.getPaginatedExports(
        request.page,
        request.limit,
        request.filters
      );

      return Result.ok({ exports, total });
    } catch (err) {
      return Result.fail(new UnexpectedError(err));
    }
  }
}
