import { ResumeData } from '@hirely/resume-core';

import { IResumeRepository } from '../../../domain/repositories/resume.repository.interface';
import { Resume } from '../../../domain/resume.aggregate';
import { ResumeName } from '../../../domain/value-objects/resume-name.vo';

import { UnexpectedError, ValidationError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';

export interface CreateResumeRequestDto {
  userId: string;
  name: string;
  templateId: string;
  data: ResumeData;
}

export type CreateResumeResponse = Result<Resume, ValidationError | UnexpectedError>;

export class CreateResumeUseCase implements UseCase<CreateResumeRequestDto, CreateResumeResponse> {
  constructor(private resumeRepository: IResumeRepository) {}

  public async execute(request: CreateResumeRequestDto): Promise<CreateResumeResponse> {
    const nameResult = ResumeName.create(request.name);

    if (nameResult.isFailure) {
      return Result.fail(new ValidationError(nameResult.error as string));
    }

    const name = nameResult.getValue();

    try {
      const resumeResult = Resume.create({
        name,
        data: request.data,
        templateId: request.templateId,
        userId: request.userId,
      });

      if (resumeResult.isFailure) {
        return Result.fail(new ValidationError(resumeResult.error as string));
      }

      const resume = resumeResult.getValue();

      await this.resumeRepository.save(resume);

      return Result.ok(resume);
    } catch (err) {
      return Result.fail(new UnexpectedError(err));
    }
  }
}
