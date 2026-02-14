import fs from 'node:fs';
import path from 'node:path';

import pino from 'pino';

import CONFIG from '@/apps/config';

const logsDir = path.resolve(process.cwd(), 'logs');
const isTestEnvironment = CONFIG.NODE_ENV === 'test';

if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

let transport: pino.LoggerOptions['transport'];
if (!isTestEnvironment) {
  if (CONFIG.NODE_ENV === 'production') {
    transport = {
      target: 'pino/file',
      options: {
        destination: './logs/app.log',
      },
    };
  } else {
    transport = {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    };
  }
}

const logger = pino({
  // name: options.name,
  level: isTestEnvironment ? 'silent' : 'info',
  transport,
});

class LoggerService {
  info(input?: unknown, meta?: Record<string, unknown>) {
    if (meta) {
      logger.info(meta, String(input));
    } else {
      logger.info(input);
    }
  }

  error(input?: unknown, meta?: Record<string, unknown>) {
    if (meta) {
      logger.error(meta, String(input));
    } else {
      logger.error(input);
    }
  }

  warn(input?: unknown, meta?: Record<string, unknown>) {
    if (meta) {
      logger.warn(meta, String(input));
    } else {
      logger.warn(input);
    }
  }
}

export default new LoggerService();
