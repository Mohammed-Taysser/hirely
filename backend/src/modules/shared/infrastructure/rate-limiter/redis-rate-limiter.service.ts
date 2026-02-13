import {
  IRateLimiter,
  RateLimitRequest,
} from '@/modules/shared/application/services/rate-limiter.service.interface';
import cacheService from '@/modules/shared/infrastructure/services/cache.service';

export class RedisRateLimiter implements IRateLimiter {
  async consume(request: RateLimitRequest): Promise<boolean> {
    const count = await cacheService.incrWithTTL(request.key, request.windowSeconds);
    return count <= request.max;
  }
}
