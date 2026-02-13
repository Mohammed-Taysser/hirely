import { RedisOptions } from 'ioredis';

import CONFIG from './config';

export const redisConnectionOptions: RedisOptions = {
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
  maxRetriesPerRequest: 0,
};
