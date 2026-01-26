import { Queue } from 'bullmq';

import { QUEUE_NAMES } from '@/apps/constant';
import { redisConnectionOptions } from '@/apps/redis';

const pdfQueue = new Queue(QUEUE_NAMES.pdf, {
  connection: redisConnectionOptions,
});

export default pdfQueue;
