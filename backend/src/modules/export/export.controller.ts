import { Request, Response } from 'express';

import exportService from './export.service';
import type { ExportDTO } from './export.dto';

import responseService from '@/modules/shared/services/response.service';
import { TypedAuthenticatedRequest } from '@/modules/shared/types/import';

async function getExportStatus(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<ExportDTO['exportStatus']>;
  const { exportId } = request.parsedParams;

  const status = await exportService.getExportStatus(request.user.id, exportId);

  responseService.success(response, {
    message: 'Export status fetched successfully',
    data: status,
  });
}

const exportController = {
  getExportStatus,
};

export default exportController;
