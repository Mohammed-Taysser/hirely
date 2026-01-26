import { User } from '@generated-prisma';
import { Request } from 'express';
import z from 'zod';

/**
 * Request extensions used by the validation layer.
 *
 * We intentionally keep Express-native fields (`body`, `query`, `params`)
 * untouched and expose validated & transformed data via:
 *
 * - `parsedBody`
 * - `parsedQuery`
 * - `parsedParams`
 *
 * This avoids breaking middleware that depends on raw request data
 * (e.g. webhooks, signature verification, logging, etc.)
 *
 * Controllers MUST rely on these parsed fields instead of the native ones.
 */
declare module 'express-serve-static-core' {
  interface Request {
    parsedQuery?: unknown;
    parsedParams?: unknown;
    parsedBody?: unknown;
  }
}

interface ValidateRequestSchemas {
  body?: z.ZodType;
  query?: z.ZodType;
  params?: z.ZodType;
}

type InferOrEmpty<T> = T extends z.ZodType ? z.infer<T> : Record<string, never>;

type InferRequest<T extends ValidateRequestSchemas> = {
  body: InferOrEmpty<T['body']>;
  params: InferOrEmpty<T['params']>;
  query: InferOrEmpty<T['query']>;
};

type TypedRequest<T extends ValidateRequestSchemas> = Request &
  InferRequest<T> & {
    parsedQuery: InferOrEmpty<T['query']>;
    parsedParams: InferOrEmpty<T['params']>;
    parsedBody: InferOrEmpty<T['body']>;
  };
type TypedAuthenticatedRequest<T extends ValidateRequestSchemas = ValidateRequestSchemas> =
  TypedRequest<T> &
    InferRequest<T> & {
      user: User;
    };
