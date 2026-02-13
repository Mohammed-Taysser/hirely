import { GetResumesListRequestDto, GetResumesListResponseDto } from './get-resumes-list.dto';

import { IResumeQueryRepository } from '@/modules/resume/application/repositories/resume.query.repository.interface';
import { UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';

type GetResumesListResponse = Result<GetResumesListResponseDto, UnexpectedError>;

export class GetResumesListUseCase implements UseCase<
  GetResumesListRequestDto,
  GetResumesListResponse
> {
  constructor(private readonly resumeQueryRepository: IResumeQueryRepository) {}

  public async execute(request: GetResumesListRequestDto): Promise<GetResumesListResponse> {
    try {
      const resumes = await this.resumeQueryRepository.getBasicResumes(request.filters);

      return Result.ok(resumes);
    } catch (err) {
      return Result.fail(new UnexpectedError(err));
    }
  }
}
