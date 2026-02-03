import { Request, Response } from 'express';

import responseService from '@/modules/shared/services/response.service';
import { GetHealthCheckUseCase } from '@/modules/system/application/use-cases/get-health-check/get-health-check.use-case';
import { OsSystemHealthService } from '@/modules/system/infrastructure/services/os-system-health.service';
import { mapAppErrorToHttp } from '@/modules/shared/application/app-error.mapper';

const systemHealthService = new OsSystemHealthService();
const getHealthCheckUseCase = new GetHealthCheckUseCase(systemHealthService);

async function getHealthCheck(request: Request, response: Response) {
  const result = await getHealthCheckUseCase.execute();

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  responseService.success(response, {
    message: 'System health check successful',
    data: result.getValue(),
  });
}

export { getHealthCheck };
