import { DeleteResumeRequestDto, DeleteResumeResponseDto } from './delete-resume.dto';

import { IResumeQueryRepository } from '@/modules/resume/application/repositories/resume.query.repository.interface';
import { IResumeRepository } from '@/modules/resume/domain/repositories/resume.repository.interface';
import { NotFoundError, UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';

type DeleteResumeResponse = Result<DeleteResumeResponseDto, UnexpectedError | NotFoundError>;

export class DeleteResumeUseCase implements UseCase<DeleteResumeRequestDto, DeleteResumeResponse> {
  constructor(
    private readonly resumeRepository: IResumeRepository,
    private readonly resumeQueryRepository: IResumeQueryRepository
  ) {}

  public async execute(request: DeleteResumeRequestDto): Promise<DeleteResumeResponse> {
    try {
      const resume = await this.resumeQueryRepository.findById(request.resumeId, request.userId);

      if (!resume) {
        return Result.fail(new NotFoundError('Resume not found'));
      }

      await this.resumeRepository.delete(request.resumeId, request.userId);

      return Result.ok(resume);
    } catch (err) {
      return Result.fail(new UnexpectedError(err));
    }
  }
}
