import { UpdateResumeRequestDto, UpdateResumeResponseDto } from './update-resume.dto';

import { IResumeRepository } from '@/modules/resume/domain/repositories/resume.repository.interface';
import { ResumeName } from '@/modules/resume/domain/value-objects/resume-name.vo';
import {
  NotFoundError,
  UnexpectedError,
  ValidationError,
} from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { IResumeSnapshotRepository } from '@/modules/resume/application/repositories/resume-snapshot.repository.interface';
import { IResumeQueryRepository } from '@/modules/resume/application/repositories/resume.query.repository.interface';

type UpdateResumeResponse = Result<
  UpdateResumeResponseDto,
  ValidationError | UnexpectedError | NotFoundError
>;

export class UpdateResumeUseCase implements UseCase<UpdateResumeRequestDto, UpdateResumeResponse> {
  constructor(
    private readonly resumeRepository: IResumeRepository,
    private readonly resumeSnapshotRepository: IResumeSnapshotRepository,
    private readonly resumeQueryRepository: IResumeQueryRepository
  ) {}

  public async execute(request: UpdateResumeRequestDto): Promise<UpdateResumeResponse> {
    try {
      const resume = await this.resumeRepository.findById(request.resumeId, request.userId);

      if (!resume) {
        return Result.fail(new NotFoundError('Resume not found'));
      }

      if (request.name) {
        const nameOrError = ResumeName.create(request.name);
        if (nameOrError.isFailure) {
          return Result.fail(new ValidationError(nameOrError.error as string));
        }
        resume.rename(nameOrError.getValue());
      }

      if (request.data) {
        resume.updateData(request.data);
      }

      if (request.templateId) {
        resume.changeTemplate(request.templateId, request.templateVersion);
      }

      if (request.themeConfig) {
        resume.updateTheme(request.themeConfig);
      }

      await this.resumeRepository.save(resume);

      const snapshot = await this.resumeSnapshotRepository.createSnapshot(
        request.userId,
        request.resumeId
      );

      if (!snapshot) {
        return Result.fail(new NotFoundError('Resume snapshot not found'));
      }

      const updated = await this.resumeQueryRepository.findById(request.resumeId, request.userId);

      if (!updated) {
        return Result.fail(new NotFoundError('Resume not found'));
      }

      return Result.ok(updated);
    } catch (err) {
      return Result.fail(new UnexpectedError(err));
    }
  }
}
