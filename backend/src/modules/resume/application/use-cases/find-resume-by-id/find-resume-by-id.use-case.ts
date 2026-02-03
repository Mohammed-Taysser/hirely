import { ResumeDtoMapper } from '../../mappers/resume.dto.mapper';
import { ResumeDto } from '../../resume.dto';

import { FindResumeByIdRequestDto } from './find-resume-by-id.dto';

import { NotFoundError, UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { IResumeRepository } from '@/modules/resume/domain/repositories/resume.repository.interface';

type FindResumeByIdResponse = Result<ResumeDto, NotFoundError | UnexpectedError>;

export class FindResumeByIdUseCase implements UseCase<
  FindResumeByIdRequestDto,
  FindResumeByIdResponse
> {
  constructor(private readonly resumeRepository: IResumeRepository) {}

  public async execute(request: FindResumeByIdRequestDto): Promise<FindResumeByIdResponse> {
    try {
      const resume = await this.resumeRepository.findById(request.resumeId, request.userId);

      if (!resume) {
        return Result.fail(new NotFoundError('Resume not found'));
      }

      return Result.ok(ResumeDtoMapper.toResponse(resume));
    } catch (err) {
      return Result.fail(new UnexpectedError(err));
    }
  }
}
