import validateRequest from '@dist/middleware/validate-request.middleware';
import userDTO from '@dist/modules/user/presentation/user.dto';
import { runErrorHandler, runMiddleware } from '../helpers/http-middleware.helper';

describe('user validation integration', () => {
  it('returns HTTP 400 for invalid user id path param', async () => {
    const request = {
      body: {},
      query: {},
      params: { userId: 'invalid-id' },
      originalUrl: '/api/users/invalid-id',
      method: 'GET',
    };

    const err = await runMiddleware(validateRequest(userDTO.getUserById), request);
    expect(err).toBeDefined();

    const response = runErrorHandler(err, request);
    expect(response.status).toHaveBeenCalledWith(400);
  });

  it('accepts valid change user plan payload with scheduleAt', async () => {
    const request: Record<string, unknown> = {
      body: {
        planCode: 'pro',
        scheduleAt: new Date(Date.now() + 3600_000).toISOString(),
      },
      query: {},
      params: { userId: '9f7d9bd2-32cf-4714-9dc9-5876b3344d37' },
    };

    const err = await runMiddleware(validateRequest(userDTO.changeUserPlan), request);
    expect(err).toBeUndefined();
    expect(request.parsedBody).toBeDefined();
    expect(request.parsedParams).toBeDefined();
  });
});
