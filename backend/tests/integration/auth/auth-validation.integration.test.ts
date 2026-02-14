import validateRequest from '@dist/middleware/validate-request.middleware';
import authDTO from '@dist/modules/auth/presentation/auth.dto';
import { AUTH_CREDENTIAL } from '../../helpers/test-fixtures';
import { runErrorHandler, runMiddleware } from '../helpers/http-middleware.helper';

describe('auth validation integration', () => {
  it('returns HTTP 400 for invalid login email', async () => {
    const request = {
      body: { email: 'invalid-email', password: AUTH_CREDENTIAL },
      query: {},
      params: {},
      originalUrl: '/api/auth/login',
      method: 'POST',
    };

    const err = await runMiddleware(validateRequest(authDTO.login), request);
    expect(err).toBeDefined();

    const response = runErrorHandler(err, request);
    expect(response.status).toHaveBeenCalledWith(400);
  });

  it('accepts valid register payload', async () => {
    const request: Record<string, unknown> = {
      body: { name: 'John Doe', email: 'john@example.com', password: AUTH_CREDENTIAL },
      query: {},
      params: {},
    };

    const err = await runMiddleware(validateRequest(authDTO.register), request);
    expect(err).toBeUndefined();
    expect(request.parsedBody).toBeDefined();
  });
});
