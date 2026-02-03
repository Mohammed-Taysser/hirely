import Redis from 'ioredis';

import { redisConnectionOptions } from '@/apps/redis';

const redis = new Redis(redisConnectionOptions);

export { redis };
