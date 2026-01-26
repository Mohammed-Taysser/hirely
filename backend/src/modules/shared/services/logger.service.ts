import fs from 'node:fs';
import path from 'node:path';

import pino from 'pino';

import CONFIG from '@/apps/config';

const logsDir = path.resolve(process.cwd(), 'logs');

if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

const logger = pino({
  // name: options.name,
  level: 'info',
  transport:
    CONFIG.NODE_ENV === 'production'
      ? {
          target: 'pino/file',
          options: {
            destination: './logs/app.log',
          },
        }
      : {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
});

class LoggerService {
  info(input?: unknown) {
    logger.info(input);
  }

  error(input?: unknown) {
    logger.error(input);
  }

  warn(input?: unknown) {
    logger.warn(input);
  }
}

export default new LoggerService();
