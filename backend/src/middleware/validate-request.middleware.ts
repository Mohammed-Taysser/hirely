import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import errorService from '@/modules/shared/presentation/error.service';
import { ValidateRequestSchemas } from '@/modules/shared/presentation/import';

function validateRequest(schemas: ValidateRequestSchemas) {
  return (request: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        const result = schemas.body.safeParse(request.body ?? {});
        if (!result.success) {
          throw result.error;
        }
        request.parsedBody = result.data;
      }

      if (schemas.query) {
        const result = schemas.query.safeParse(request.query);
        if (!result.success) {
          throw result.error;
        }
        request.parsedQuery = result.data;
      }

      if (schemas.params) {
        const result = schemas.params.safeParse(request.params);
        if (!result.success) {
          throw result.error;
        }
        request.parsedParams = result.data;
      }

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(
          errorService.badRequest(err.issues.map((i) => `${i.path.join('.')}: ${i.message}`))
        );
      }

      next(err);
    }
  };
}

export default validateRequest;
