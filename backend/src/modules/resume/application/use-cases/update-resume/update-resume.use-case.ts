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

type UpdateResumeResponse = Result<
  UpdateResumeResponseDto,
  ValidationError | UnexpectedError | NotFoundError
>;

export class UpdateResumeUseCase implements UseCase<UpdateResumeRequestDto, UpdateResumeResponse> {
  constructor(private readonly resumeRepository: IResumeRepository) {}

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

      return Result.ok({
        id: resume.id,
        name: resume.name.value,
        data: resume.data,
        templateId: resume.templateId,
        templateVersion: resume.templateVersion,
        themeConfig: resume.themeConfig,
        updatedAt: resume.updatedAt,
      });
    } catch (err) {
      return Result.fail(new UnexpectedError(err));
    }
  }
}
