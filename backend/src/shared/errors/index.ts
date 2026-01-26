export type ErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "UNAUTHORIZED"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL";

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(message: string, statusCode: number, code: ErrorCode, details?: Record<string, unknown>) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export const validationError = (message: string, details?: Record<string, unknown>) =>
  new AppError(message, 400, "VALIDATION_ERROR", details);

export const unauthorizedError = (message = "Unauthorized") =>
  new AppError(message, 401, "UNAUTHORIZED");

export const forbiddenError = (message = "Forbidden") =>
  new AppError(message, 403, "FORBIDDEN");

export const notFoundError = (message = "Not found") =>
  new AppError(message, 404, "NOT_FOUND");

export const conflictError = (message = "Conflict") =>
  new AppError(message, 409, "CONFLICT");

export const rateLimitedError = (message = "Too many requests") =>
  new AppError(message, 429, "RATE_LIMITED");
