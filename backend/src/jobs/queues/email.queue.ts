import { Queue } from 'bullmq';

import { QUEUE_NAMES } from '@/apps/constant';
import { redisConnectionOptions } from '@/apps/redis';

const emailQueue = new Queue(QUEUE_NAMES.email, {
  connection: redisConnectionOptions,
});

export default emailQueue;
