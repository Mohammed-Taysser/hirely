import { exportResumeCommand } from '@/commands/exportResume.command';
import { AppError, NotFoundError, UnexpectedError } from '@/modules/shared/application/app-error';
import { mapBaseErrorToAppError } from '@/modules/shared/application/app-error.mapper';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { BaseError } from '@/modules/shared/services/error.service';

import {
  EnqueueResumeExportRequestDto,
  EnqueueResumeExportResponseDto,
} from './enqueue-resume-export.dto';

type EnqueueResumeExportResponse = Result<EnqueueResumeExportResponseDto, AppError>;

export class EnqueueResumeExportUseCase
  implements UseCase<EnqueueResumeExportRequestDto, EnqueueResumeExportResponse>
{
  public async execute(
    request: EnqueueResumeExportRequestDto
  ): Promise<EnqueueResumeExportResponse> {
    try {
      const result = await exportResumeCommand(request.user, request.resumeId);
      return Result.ok(result);
    } catch (err) {
      if (err instanceof BaseError) {
        return Result.fail(mapBaseErrorToAppError(err));
      }
      if (err instanceof Error && err.message.includes('Resume not found')) {
        return Result.fail(new NotFoundError('Resume not found'));
      }
      return Result.fail(new UnexpectedError(err));
    }
  }
}
