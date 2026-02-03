import {
  AppError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
  UnexpectedError,
  ValidationError,
} from './app-error';

import errorService, { BaseError } from '@/modules/shared/services/error.service';

const mapBaseErrorToAppError = (error: BaseError): AppError => {
  const message = error.message;
  switch (error.statusCode) {
    case 400:
      return new ValidationError(message);
    case 401:
      return new UnauthorizedError(message);
    case 403:
      return new ForbiddenError(message);
    case 404:
      return new NotFoundError(message);
    case 409:
      return new ConflictError(message);
    case 429:
      return new TooManyRequestsError(message);
    default:
      return new UnexpectedError(error);
  }
};

const mapAppErrorToHttp = (error: AppError): BaseError => {
  if (error instanceof ValidationError) {
    return errorService.badRequest(error.message);
  }
  if (error instanceof UnauthorizedError) {
    return errorService.unauthorized(error.message);
  }
  if (error instanceof ForbiddenError) {
    return errorService.forbidden(error.message);
  }
  if (error instanceof NotFoundError) {
    return errorService.notFound(error.message);
  }
  if (error instanceof ConflictError) {
    return errorService.conflict(error.message);
  }
  if (error instanceof TooManyRequestsError) {
    return errorService.tooManyRequests(error.message);
  }
  return errorService.internal();
};

export { mapAppErrorToHttp, mapBaseErrorToAppError };
