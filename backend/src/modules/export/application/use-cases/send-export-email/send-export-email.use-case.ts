import { SendExportEmailRequestDto } from './send-export-email.dto';

import { AppError, UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { IExportEmailService } from '@/modules/export/application/services/export-email.service.interface';

type SendExportEmailResponse = Result<void, AppError>;

export class SendExportEmailUseCase implements UseCase<
  SendExportEmailRequestDto,
  SendExportEmailResponse
> {
  constructor(private readonly exportEmailService: IExportEmailService) {}

  async execute(request: SendExportEmailRequestDto): Promise<SendExportEmailResponse> {
    try {
      await this.exportEmailService.sendExportEmail(request);
      return Result.ok();
    } catch (err) {
      if (err instanceof AppError) {
        return Result.fail(err);
      }
      return Result.fail(new UnexpectedError(err));
    }
  }
}
