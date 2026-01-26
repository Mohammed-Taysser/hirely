import { ReasonPhrases, StatusCodes } from 'http-status-codes';

abstract class BaseError extends Error {
  readonly statusCode: number;
  readonly payload: ErrorContent;

  protected constructor(error: ErrorContent, statusCode: number) {
    const resolvedMessage = JSON.stringify(error);

    super(resolvedMessage);

    this.payload = error;
    this.statusCode = statusCode;

    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      statusCode: this.statusCode,
      error: this.payload,
    };
  }
}

class BadRequestError extends BaseError {
  constructor(error: ErrorContent = ReasonPhrases.BAD_REQUEST) {
    super(error, StatusCodes.BAD_REQUEST);
  }
}

class UnauthorizedError extends BaseError {
  constructor(error: ErrorContent = ReasonPhrases.UNAUTHORIZED) {
    super(error, StatusCodes.UNAUTHORIZED);
  }
}

class NotFoundError extends BaseError {
  constructor(error: ErrorContent = ReasonPhrases.NOT_FOUND) {
    super(error, StatusCodes.NOT_FOUND);
  }
}

class ForbiddenError extends BaseError {
  constructor(error: ErrorContent = ReasonPhrases.FORBIDDEN) {
    super(error, StatusCodes.FORBIDDEN);
  }
}

class ConflictError extends BaseError {
  constructor(error: ErrorContent = ReasonPhrases.CONFLICT) {
    super(error, StatusCodes.CONFLICT);
  }
}

class InternalServerError extends BaseError {
  constructor(error: ErrorContent = ReasonPhrases.INTERNAL_SERVER_ERROR) {
    super(error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

class TooManyRequestsError extends BaseError {
  constructor(error: ErrorContent = ReasonPhrases.TOO_MANY_REQUESTS) {
    super(error, StatusCodes.TOO_MANY_REQUESTS);
  }
}

class ErrorService {
  badRequest(error?: ErrorContent) {
    return new BadRequestError(error);
  }

  unauthorized(error?: ErrorContent) {
    return new UnauthorizedError(error);
  }

  forbidden(error?: ErrorContent) {
    return new ForbiddenError(error);
  }

  notFound(error?: ErrorContent) {
    return new NotFoundError(error);
  }

  conflict(error?: ErrorContent) {
    return new ConflictError(error);
  }

  tooManyRequests(error?: ErrorContent) {
    return new TooManyRequestsError(error);
  }

  internal(error?: ErrorContent) {
    return new InternalServerError(error);
  }
}

export default new ErrorService();

export { BaseError };
