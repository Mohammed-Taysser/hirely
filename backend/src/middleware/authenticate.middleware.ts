import { NextFunction, Request, Response } from 'express';

import prisma from '@/apps/prisma';
import errorService from '@/modules/shared/services/error.service';
import tokenService from '@/modules/shared/services/token.service';
import { AuthenticatedRequest } from '@/modules/shared/types/import';

async function authenticateMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    const request = req as AuthenticatedRequest;
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

    let decoded;
    try {
      decoded = tokenService.verifyToken(token.trim());
    } catch (error) {
      return next(error);
    }

    // Defensive guard
    if (!decoded || typeof decoded !== 'object' || !decoded.id) {
      return next(errorService.unauthorized('Invalid token payload'));
    }

    // Fetch only required user details (minimal)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return next(errorService.unauthorized('User not found'));
    }

    request.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
}

export default authenticateMiddleware;
