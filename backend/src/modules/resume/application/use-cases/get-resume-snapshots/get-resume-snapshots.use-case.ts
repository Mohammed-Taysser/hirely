import { GetResumeSnapshotsRequestDto, GetResumeSnapshotsResponseDto } from './get-resume-snapshots.dto';

import { UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { IResumeQueryRepository } from '@/modules/resume/application/repositories/resume.query.repository.interface';

type GetResumeSnapshotsResponse = Result<GetResumeSnapshotsResponseDto, UnexpectedError>;

export class GetResumeSnapshotsUseCase
  implements UseCase<GetResumeSnapshotsRequestDto, GetResumeSnapshotsResponse>
{
  constructor(private readonly resumeQueryRepository: IResumeQueryRepository) {}

  public async execute(
    request: GetResumeSnapshotsRequestDto
  ): Promise<GetResumeSnapshotsResponse> {
    try {
      const [snapshots, total] = await this.resumeQueryRepository.getPaginatedSnapshots(
        request.page,
        request.limit,
        request.filters
      );

      return Result.ok({ snapshots, total });
    } catch (err) {
      return Result.fail(new UnexpectedError(err));
    }
  }
}
