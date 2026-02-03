import { UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import {
  ISystemHealthService,
  SystemHealthSnapshot,
} from '@/modules/system/application/services/system-health.service.interface';

type GetHealthCheckResponse = Result<SystemHealthSnapshot, UnexpectedError>;

export class GetHealthCheckUseCase implements UseCase<void, GetHealthCheckResponse> {
  constructor(private readonly systemHealthService: ISystemHealthService) {}

  public async execute(): Promise<GetHealthCheckResponse> {
    try {
      const snapshot = this.systemHealthService.getSnapshot();
      return Result.ok(snapshot);
    } catch (err) {
      return Result.fail(new UnexpectedError(err));
    }
  }
}
