import { NextFunction, Request, Response } from 'express';

import { RateLimitConfig } from '@/apps/constant';
import cacheService from '@/modules/shared/infrastructure/services/cache.service';
import loggerService from '@/modules/shared/infrastructure/services/logger.service';
import errorService from '@/modules/shared/presentation/error.service';

/**
 * Creates a Redis-based rate limiter middleware
 * @param max Max requests allowed
 * @param windowSeconds Time window in seconds
 */
function rateLimiter(options: RateLimitConfig) {
  const { max = 1000, windowSeconds = 60, keyTemplate } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Default key by IP
      const key = cacheService.formatKey(keyTemplate, { ip: req.ip });

      // Increment counter atomically
      const current = await cacheService.incrWithTTL(key, windowSeconds);

      // Optional headers
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(max - current, 0));

      const ttl = await cacheService.ttl(key);
      res.setHeader('X-RateLimit-Reset', ttl);

      if (current > max) {
        return next(errorService.tooManyRequests('Too many requests, please try again later.'));
      }

      next();
    } catch (err) {
      loggerService.error('Rate limiter error', { error: err });
      next(); // fail open if Redis fails
    }
  };
}

export default rateLimiter;
