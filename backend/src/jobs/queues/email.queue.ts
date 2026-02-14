import { JobsOptions, Queue } from 'bullmq';

import { QUEUE_NAMES } from '@/apps/constant';
import { redisConnectionOptions } from '@/apps/redis';

type QueueLike = {
  add: (name: string, data: unknown, opts?: JobsOptions) => Promise<unknown>;
  close: () => Promise<void>;
};

let queue: QueueLike | null = null;

const createQueue = (): QueueLike => {
  if (process.env.NODE_ENV === 'test') {
    return {
      add: async () => ({ id: 'test-job' }),
      close: async () => undefined,
    };
  }

  return new Queue(QUEUE_NAMES.email, {
    connection: redisConnectionOptions,
  });
};

const getQueue = (): QueueLike => {
  if (!queue) {
    queue = createQueue();
  }

  return queue;
};

const emailQueue: QueueLike = {
  add: (name: string, data: unknown, opts?: JobsOptions) => getQueue().add(name, data, opts),
  close: () => getQueue().close(),
};

export default emailQueue;
