import { Queue } from 'bullmq';

import { QUEUE_NAMES } from '@/apps/constant';
import { redisConnectionOptions } from '@/apps/redis';

const planQueue = new Queue(QUEUE_NAMES.planChanges, {
  connection: redisConnectionOptions,
});

export default planQueue;
