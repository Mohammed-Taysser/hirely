import Redis from 'ioredis';

import loggerService from './logger.service';

import { redisConnectionOptions } from '@/apps/redis';

type KeyTemplateVars = Record<string, string | number | undefined>;

interface CacheOptions {
  ttl?: number; // seconds
}

class CacheService {
  private readonly client: Redis;

  constructor() {
    this.client = new Redis(redisConnectionOptions);
    this.client.on('error', (err) => loggerService.error('Redis error', { error: err }));
  }

  /** Format a key using a template and variables */
  formatKey(template: string, vars: KeyTemplateVars): string {
    return template.replace(/{(\w+)}/g, (_, k) => {
      if (vars[k] === undefined) throw new Error(`Missing key variable: ${k}`);
      return String(vars[k]);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      loggerService.warn('[Cache][GET]');
      loggerService.warn(error);
      return null;
    }
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    try {
      const payload = JSON.stringify(value);

      if (options.ttl) {
        await this.client.set(key, payload, 'EX', options.ttl);
      } else {
        await this.client.set(key, payload);
      }
    } catch (error) {
      loggerService.warn('[Cache][SET]');
      loggerService.warn(error);
    }
  }

  async del(key: string) {
    return this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    try {
      return (await this.client.exists(key)) === 1;
    } catch {
      return false;
    }
  }

  async increment(key: string) {
    return this.client.incr(key);
  }

  async incrWithTTL(key: string, ttlSeconds?: number): Promise<number> {
    const current = await this.client.incr(key);
    if (current === 1 && ttlSeconds) {
      await this.client.expire(key, ttlSeconds);
    }
    return current;
  }

  async expire(key: string, ttl: number) {
    return this.client.expire(key, ttl);
  }

  async ttl(key: string) {
    return this.client.ttl(key);
  }
}

export default new CacheService();
