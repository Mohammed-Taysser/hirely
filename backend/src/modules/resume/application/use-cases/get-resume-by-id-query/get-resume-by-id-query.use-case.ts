import { GetResumeByIdQueryRequestDto } from './get-resume-by-id-query.dto';

import {
  IResumeQueryRepository,
  ResumeFullDto,
} from '@/modules/resume/application/repositories/resume.query.repository.interface';
import { NotFoundError, UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';

type GetResumeByIdQueryResponse = Result<ResumeFullDto, NotFoundError | UnexpectedError>;

export class GetResumeByIdQueryUseCase implements UseCase<
  GetResumeByIdQueryRequestDto,
  GetResumeByIdQueryResponse
> {
  constructor(private readonly resumeQueryRepository: IResumeQueryRepository) {}

  public async execute(request: GetResumeByIdQueryRequestDto): Promise<GetResumeByIdQueryResponse> {
    try {
      const resume = await this.resumeQueryRepository.findById(request.resumeId, request.userId);

      if (!resume) {
        return Result.fail(new NotFoundError('Resume not found'));
      }

      return Result.ok(resume);
    } catch (err) {
      return Result.fail(new UnexpectedError(err));
    }
  }
}
