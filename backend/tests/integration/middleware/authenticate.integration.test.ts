import authenticateMiddleware from '@dist/middleware/authenticate.middleware';
import { runErrorHandler } from '../helpers/http-middleware.helper';

const runMiddleware = async (req: Record<string, unknown>): Promise<unknown> =>
  new Promise((resolve) => {
    authenticateMiddleware(req as never, {} as never, (err?: unknown) => resolve(err));
  });

describe('authenticate middleware integration', () => {
  it('returns unauthorized when Authorization header is missing', async () => {
    const request = {
      headers: {},
      originalUrl: '/api/resumes',
      method: 'GET',
    };

    const err = await runMiddleware(request);
    expect(err).toBeDefined();

    const response = runErrorHandler(err, request);
    expect(response.status).toHaveBeenCalledWith(401);

    const payload = response.json.mock.calls[0][0];
    expect(payload.success).toBe(false);
    expect(payload.error).toBe('Authorization header missing');
  });

  it('returns unauthorized for invalid bearer header format', async () => {
    const request = {
      headers: {
        authorization: 'Token abc',
      },
      originalUrl: '/api/resumes',
      method: 'GET',
    };

    const err = await runMiddleware(request);
    expect(err).toBeDefined();

    const response = runErrorHandler(err, request);
    expect(response.status).toHaveBeenCalledWith(401);

    const payload = response.json.mock.calls[0][0];
    expect(payload.success).toBe(false);
    expect(payload.error).toBe('Invalid Authorization format');
  });

  it('returns unauthorized when bearer token is missing', async () => {
    const request = {
      headers: {
        authorization: 'Bearer ',
      },
      originalUrl: '/api/resumes',
      method: 'GET',
    };

    const err = await runMiddleware(request);
    expect(err).toBeDefined();

    const response = runErrorHandler(err, request);
    expect(response.status).toHaveBeenCalledWith(401);

    const payload = response.json.mock.calls[0][0];
    expect(payload.success).toBe(false);
    expect(payload.error).toBe('Invalid Authorization format');
  });

  it('returns unauthorized for invalid or expired bearer token', async () => {
    const request = {
      headers: {
        authorization: 'Bearer invalid-token',
      },
      originalUrl: '/api/resumes',
      method: 'GET',
    };

    const err = await runMiddleware(request);
    expect(err).toBeDefined();

    const response = runErrorHandler(err, request);
    expect(response.status).toHaveBeenCalledWith(401);

    const payload = response.json.mock.calls[0][0];
    expect(payload.success).toBe(false);
    expect(payload.error).toBe('Invalid or expired token');
  });
});
