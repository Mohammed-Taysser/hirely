import { CreateResumeSnapshotRequestDto } from './create-resume-snapshot.dto';

import { NotFoundError, UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import {
  IResumeSnapshotRepository,
  ResumeSnapshotDto,
} from '@/modules/resume/application/repositories/resume-snapshot.repository.interface';

type CreateResumeSnapshotResponse = Result<ResumeSnapshotDto, NotFoundError | UnexpectedError>;

export class CreateResumeSnapshotUseCase
  implements UseCase<CreateResumeSnapshotRequestDto, CreateResumeSnapshotResponse>
{
  constructor(private readonly resumeSnapshotRepository: IResumeSnapshotRepository) {}

  public async execute(
    request: CreateResumeSnapshotRequestDto
  ): Promise<CreateResumeSnapshotResponse> {
    try {
      const snapshot = await this.resumeSnapshotRepository.createSnapshot(
        request.userId,
        request.resumeId
      );

      if (!snapshot) {
        return Result.fail(new NotFoundError('Resume snapshot not found'));
      }

      return Result.ok(snapshot);
    } catch (err) {
      return Result.fail(new UnexpectedError(err));
    }
  }
}
