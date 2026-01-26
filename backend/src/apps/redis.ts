import Redis, { RedisOptions } from 'ioredis';

import CONFIG from '@/apps/config';
import loggerService from '@/modules/shared/services/logger.service';

const redisConnectionOptions: RedisOptions = {
  host: CONFIG.REDIS_HOST,
  port: CONFIG.REDIS_PORT,
  // Fail commands immediately if not connected (avoid hanging requests)
  enableOfflineQueue: false,
  // Short timeout for initial connection
  connectTimeout: 1000,
  // Try reconnecting every 5 seconds if connection is lost
  retryStrategy(times) {
    const delay = Math.min(times * 100, 5000);
    return delay;
  },
  // Stop after 0 attempts to log a definitive error for current command, then keep trying at long intervals
  // This ensures that if the service is down, the command fails instantly.
  maxRetriesPerRequest: 0,
};

const redis = new Redis(redisConnectionOptions);

redis.on('connect', () => {
  loggerService.info('Successfully connected to Redis');
});

redis.on('error', (error: Error) => {
  const err = error as Error & { code?: string };
  // Only log if it's not a connection failure (to avoid spamming logs)
  if (err.code !== 'ECONNREFUSED' && err.code !== 'NR_CLOSED' && err.code !== 'CONNECTION_BROKEN') {
    loggerService.error(error);
  }
});

export default redis;

export { redisConnectionOptions };
