import { GetResumesRequestDto, GetResumesResponseDto } from './get-resumes.dto';

import { IResumeQueryRepository } from '@/modules/resume/application/repositories/resume.query.repository.interface';
import { UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';

type GetResumesResponse = Result<GetResumesResponseDto, UnexpectedError>;

export class GetResumesUseCase implements UseCase<GetResumesRequestDto, GetResumesResponse> {
  constructor(private readonly resumeQueryRepository: IResumeQueryRepository) {}

  public async execute(request: GetResumesRequestDto): Promise<GetResumesResponse> {
    try {
      const [resumes, total] = await this.resumeQueryRepository.getPaginatedResumes(
        request.page,
        request.limit,
        request.filters
      );

      return Result.ok({ resumes, total });
    } catch (err) {
      return Result.fail(new UnexpectedError(err));
    }
  }
}
