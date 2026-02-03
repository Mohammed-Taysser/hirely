export abstract class AppError {
  constructor(public readonly message: string) {}
}

export class UnexpectedError extends AppError {
  public readonly error: unknown;

  constructor(err: unknown) {
    super('An unexpected error occurred.');
    this.error = err;
  }
}

export class ValidationError extends AppError {}

export class ConflictError extends AppError {}

export class NotFoundError extends AppError {}
