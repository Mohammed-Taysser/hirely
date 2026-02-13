import {
  AppError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
  UnexpectedError,
  ValidationError,
} from '@/modules/shared/application/app-error';
import errorService from '@/modules/shared/presentation/error.service';

const mapAppErrorToHttp = (error: AppError | null | undefined) => {
  if (!error) {
    return errorService.internal();
  }
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
  if (error instanceof UnexpectedError) {
    return errorService.internal(error.message);
  }
  return errorService.internal();
};

export { mapAppErrorToHttp };
