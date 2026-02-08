import { Request, Response } from 'express';

import type { ExportDTO } from './export.dto';

import responseService from '@/modules/shared/services/response.service';
import { TypedAuthenticatedRequest } from '@/modules/shared/types/import';
import { mapAppErrorToHttp } from '@/modules/shared/presentation/app-error.mapper';
import { exportContainer } from '@/apps/container';

const { getExportStatusUseCase } = exportContainer;

async function getExportStatus(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<ExportDTO['exportStatus']>;
  const { exportId } = request.parsedParams;

  const result = await getExportStatusUseCase.execute({
    userId: request.user.id,
    exportId,
  });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  responseService.success(response, {
    message: 'Export status fetched successfully',
    data: result.getValue(),
  });
}

const exportController = {
  getExportStatus,
};

export default exportController;
