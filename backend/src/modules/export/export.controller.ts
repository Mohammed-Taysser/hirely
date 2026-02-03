import { Request, Response } from 'express';

import type { ExportDTO } from './export.dto';

import responseService from '@/modules/shared/services/response.service';
import { TypedAuthenticatedRequest } from '@/modules/shared/types/import';
import { GetExportStatusUseCase } from '@/modules/export/application/use-cases/get-export-status/get-export-status.use-case';
import { ExportStatusService } from '@/modules/export/infrastructure/services/export-status.service';
import { mapAppErrorToHttp } from '@/modules/shared/application/app-error.mapper';

const exportStatusService = new ExportStatusService();
const getExportStatusUseCase = new GetExportStatusUseCase(exportStatusService);

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
