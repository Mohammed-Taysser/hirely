import validateRequest from '@dist/middleware/validate-request.middleware';
import auditDTO from '@dist/modules/audit/presentation/audit.dto';
import { runErrorHandler, runMiddleware } from '../helpers/http-middleware.helper';

describe('audit validation integration', () => {
  it('returns HTTP 400 for invalid audit entity type', async () => {
    const request = {
      body: {},
      query: {
        entityType: 'job',
        entityId: 'f06d4f77-e0ad-4044-a19c-7adb9fbd0ff3',
        page: 1,
        limit: 10,
      },
      params: {},
      originalUrl: '/api/audit-logs',
      method: 'GET',
    };

    const err = await runMiddleware(validateRequest(auditDTO.getAuditLogs), request);
    expect(err).toBeDefined();

    const response = runErrorHandler(err, request);
    expect(response.status).toHaveBeenCalledWith(400);
  });

  it('accepts valid audit logs query params', async () => {
    const request: Record<string, unknown> = {
      body: {},
      query: {
        entityType: 'resume',
        entityId: 'f06d4f77-e0ad-4044-a19c-7adb9fbd0ff3',
        page: 1,
        limit: 10,
      },
      params: {},
    };

    const err = await runMiddleware(validateRequest(auditDTO.getAuditLogs), request);
    expect(err).toBeUndefined();
    expect(request.parsedQuery).toBeDefined();
  });
});
