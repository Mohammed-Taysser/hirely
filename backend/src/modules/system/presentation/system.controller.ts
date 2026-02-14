import { Request, Response } from 'express';

import type { SystemDTO } from './system.dto';

import { systemContainer } from '@/apps/container';
import { mapAppErrorToHttp } from '@/modules/shared/presentation/app-error.mapper';
import { TypedAuthenticatedRequest } from '@/modules/shared/presentation/import';
import responseService from '@/modules/shared/presentation/response.service';

const { getHealthCheckUseCase, getExportOpsMetricsUseCase } = systemContainer;

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

async function getExportOpsMetrics(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<SystemDTO['getExportOpsMetrics']>;
  const result = await getExportOpsMetricsUseCase.execute({ hours: request.parsedQuery.hours });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  responseService.success(response, {
    message: 'Export operation metrics fetched successfully',
    data: result.getValue(),
  });
}

export { getExportOpsMetrics, getHealthCheck };
