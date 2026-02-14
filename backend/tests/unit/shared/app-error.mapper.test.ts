import {
  AppError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
  UnexpectedError,
  ValidationError,
} from '@dist/modules/shared/application/app-error';
import { mapAppErrorToHttp } from '@dist/modules/shared/presentation/app-error.mapper';

describe('app-error.mapper', () => {
  it('maps validation error to 400', () => {
    const httpError = mapAppErrorToHttp(new ValidationError('invalid'));
    expect(httpError.statusCode).toBe(400);
  });

  it('maps unauthorized error to 401', () => {
    const httpError = mapAppErrorToHttp(new UnauthorizedError('unauthorized'));
    expect(httpError.statusCode).toBe(401);
  });

  it('maps forbidden error to 403', () => {
    const httpError = mapAppErrorToHttp(new ForbiddenError('forbidden'));
    expect(httpError.statusCode).toBe(403);
  });

  it('maps not found error to 404', () => {
    const httpError = mapAppErrorToHttp(new NotFoundError('not found'));
    expect(httpError.statusCode).toBe(404);
  });

  it('maps conflict error to 409', () => {
    const httpError = mapAppErrorToHttp(new ConflictError('conflict'));
    expect(httpError.statusCode).toBe(409);
  });

  it('maps too many requests error to 429', () => {
    const httpError = mapAppErrorToHttp(new TooManyRequestsError('limit'));
    expect(httpError.statusCode).toBe(429);
  });

  it('maps unexpected error to 500', () => {
    const httpError = mapAppErrorToHttp(new UnexpectedError(new Error('boom')));
    expect(httpError.statusCode).toBe(500);
  });

  it('maps null error to generic internal error', () => {
    const httpError = mapAppErrorToHttp(null);
    expect(httpError.statusCode).toBe(500);
  });

  it('maps undefined error to generic internal error', () => {
    const httpError = mapAppErrorToHttp(undefined);
    expect(httpError.statusCode).toBe(500);
  });

  it('maps unknown app error subtype to generic internal error', () => {
    class UnmappedError extends AppError {}

    const httpError = mapAppErrorToHttp(new UnmappedError('unmapped'));
    expect(httpError.statusCode).toBe(500);
  });
});
