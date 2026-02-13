import { Request, Response } from 'express';

import type { AuditDTO } from './audit.dto';

import { auditContainer } from '@/apps/container';
import { mapAppErrorToHttp } from '@/modules/shared/presentation/app-error.mapper';
import { TypedAuthenticatedRequest } from '@/modules/shared/presentation/import';
import responseService from '@/modules/shared/presentation/response.service';

const { getAuditLogsUseCase } = auditContainer;

async function getAuditLogs(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<AuditDTO['getAuditLogs']>;
  const query = request.parsedQuery;

  const result = await getAuditLogsUseCase.execute({
    entityType: query.entityType,
    entityId: query.entityId,
    page: query.page,
    limit: query.limit,
  });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  const { logs, total } = result.getValue();

  responseService.paginated(response, {
    message: 'Audit logs fetched successfully',
    data: logs,
    metadata: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    },
  });
}

const auditController = {
  getAuditLogs,
};

export default auditController;
