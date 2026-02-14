import validateRequest from '@dist/middleware/validate-request.middleware';
import planDTO from '@dist/modules/plan/presentation/plan.dto';
import { runErrorHandler, runMiddleware } from '../helpers/http-middleware.helper';

describe('plan validation integration', () => {
  it('returns HTTP 400 when update payload is empty', async () => {
    const request = {
      body: {},
      query: {},
      params: { planId: '2be27d3c-7ff5-4ec7-90dc-9fc1db1f7f7b' },
      originalUrl: '/api/plans/2be27d3c-7ff5-4ec7-90dc-9fc1db1f7f7b',
      method: 'PATCH',
    };

    const err = await runMiddleware(validateRequest(planDTO.updatePlan), request);
    expect(err).toBeDefined();

    const response = runErrorHandler(err, request);
    expect(response.status).toHaveBeenCalledWith(400);

    const payload = response.json.mock.calls[0][0];
    expect(JSON.stringify(payload.error)).toContain('At least one field must be provided');
  });

  it('accepts valid create plan payload', async () => {
    const request: Record<string, unknown> = {
      body: {
        code: 'pro',
        name: 'Pro Plan',
        description: 'For advanced users',
        limits: {
          maxResumes: 20,
          maxExports: 100,
          dailyUploadMb: 500,
        },
      },
      query: {},
      params: {},
    };

    const err = await runMiddleware(validateRequest(planDTO.createPlan), request);
    expect(err).toBeUndefined();
    expect(request.parsedBody).toBeDefined();
  });
});
