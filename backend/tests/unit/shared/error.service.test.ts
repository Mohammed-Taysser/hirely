import errorService from '@dist/modules/shared/presentation/error.service';

describe('error.service', () => {
  it('creates expected HTTP error types', () => {
    expect(errorService.badRequest('bad').statusCode).toBe(400);
    expect(errorService.unauthorized('no').statusCode).toBe(401);
    expect(errorService.forbidden('forbidden').statusCode).toBe(403);
    expect(errorService.notFound('missing').statusCode).toBe(404);
    expect(errorService.conflict('conflict').statusCode).toBe(409);
    expect(errorService.tooManyRequests('limit').statusCode).toBe(429);
    expect(errorService.internal('internal').statusCode).toBe(500);
  });

  it('serializes base error payload via toJSON', () => {
    const err = errorService.badRequest({ field: 'email', message: 'invalid' });
    expect(err.toJSON()).toEqual({
      name: expect.any(String),
      statusCode: 400,
      error: { field: 'email', message: 'invalid' },
    });
  });

  it('uses default reason phrases when payload is omitted', () => {
    expect(errorService.badRequest().payload).toBe('Bad Request');
    expect(errorService.unauthorized().payload).toBe('Unauthorized');
    expect(errorService.forbidden().payload).toBe('Forbidden');
    expect(errorService.notFound().payload).toBe('Not Found');
    expect(errorService.conflict().payload).toBe('Conflict');
    expect(errorService.tooManyRequests().payload).toBe('Too Many Requests');
    expect(errorService.internal().payload).toBe('Internal Server Error');
  });

  it('supports array payloads', () => {
    const err = errorService.badRequest(['field-a', 'field-b']);
    expect(err.payload).toEqual(['field-a', 'field-b']);
    expect(err.statusCode).toBe(400);
  });
});
