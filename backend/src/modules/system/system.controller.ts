import { Request, Response } from 'express';

import responseService from '@/modules/shared/services/response.service';
import { mapAppErrorToHttp } from '@/modules/shared/presentation/app-error.mapper';
import { systemContainer } from '@/apps/container';

const { getHealthCheckUseCase } = systemContainer;

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
