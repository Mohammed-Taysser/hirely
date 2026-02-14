import { Queue } from 'bullmq';

import { QUEUE_NAMES } from '@/apps/constant';
import { redisConnectionOptions } from '@/apps/redis';

const exportCleanupQueue = new Queue(QUEUE_NAMES.exportCleanup, {
  connection: redisConnectionOptions,
});

export default exportCleanupQueue;
