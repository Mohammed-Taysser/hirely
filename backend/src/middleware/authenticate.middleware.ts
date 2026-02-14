import { NextFunction, Request, Response } from 'express';

import { userContainer } from '@/apps/container';
import { NotFoundError } from '@/modules/shared/application/app-error';
import { UserTokenPayload } from '@/modules/shared/application/services/token.service.interface';
import tokenService from '@/modules/shared/infrastructure/services/token.service';
import errorService from '@/modules/shared/presentation/error.service';
import { TypedAuthenticatedRequest } from '@/modules/shared/presentation/import';

async function authenticateMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    const request = req as TypedAuthenticatedRequest;
    const authHeader = request.headers.authorization;

    // Missing header
    if (!authHeader) {
      return next(errorService.unauthorized('Authorization header missing'));
    }

    // Must start with "Bearer "
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return next(errorService.unauthorized('Invalid Authorization format'));
    }

    let decoded: UserTokenPayload;
    try {
      decoded = tokenService.verifyToken<UserTokenPayload>(token.trim());
    } catch {
      return next(errorService.unauthorized('Invalid or expired token'));
    }

    // Defensive guard
    if (!decoded?.id) {
      return next(errorService.unauthorized('Invalid token payload'));
    }

    // Fetch only required user details (minimal)
    const userResult = await userContainer.getUserByIdQueryUseCase.execute({ userId: decoded.id });
    if (userResult.isFailure) {
      if (userResult.error instanceof NotFoundError) {
        return next(errorService.unauthorized('User not found'));
      }
      return next(errorService.internal());
    }

    const user = userResult.getValue();

    request.user = {
      id: user.id,
      planId: user.planId,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
    };
    return next();
  } catch (err) {
    return next(err);
  }
}

export default authenticateMiddleware;
