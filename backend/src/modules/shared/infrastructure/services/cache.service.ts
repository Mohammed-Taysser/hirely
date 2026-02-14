import Redis from 'ioredis';

import loggerService from './logger.service';

import CONFIG from '@/apps/config';
import { redisConnectionOptions } from '@/apps/redis';

type KeyTemplateVars = Record<string, string | number | undefined>;

interface CacheOptions {
  ttl?: number; // seconds
}

class CacheService {
  private readonly client: Redis | null;
  private readonly memory = new Map<string, { value: string; expiresAt?: number }>();

  constructor() {
    if (CONFIG.NODE_ENV === 'test') {
      this.client = null;
      return;
    }

    this.client = new Redis(redisConnectionOptions);
    this.client.on('error', (err) => loggerService.error('Redis error', { error: err }));
  }

  private nowMs(): number {
    return Date.now();
  }

  private purgeExpired(key: string) {
    const entry = this.memory.get(key);
    if (!entry?.expiresAt) {
      return;
    }

    if (entry.expiresAt <= this.nowMs()) {
      this.memory.delete(key);
    }
  }

  private setMemoryValue(key: string, rawValue: string, ttlSeconds?: number) {
    const expiresAt = ttlSeconds ? this.nowMs() + ttlSeconds * 1000 : undefined;
    this.memory.set(key, { value: rawValue, expiresAt });
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
      if (!this.client) {
        this.purgeExpired(key);
        const memoryValue = this.memory.get(key)?.value;
        if (!memoryValue) return null;
        return JSON.parse(memoryValue) as T;
      }

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

      if (!this.client) {
        this.setMemoryValue(key, payload, options.ttl);
        return;
      }

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
    if (!this.client) {
      const existed = this.memory.delete(key);
      return existed ? 1 : 0;
    }

    return this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (!this.client) {
        this.purgeExpired(key);
        return this.memory.has(key);
      }

      return (await this.client.exists(key)) === 1;
    } catch {
      return false;
    }
  }

  async increment(key: string) {
    if (!this.client) {
      this.purgeExpired(key);
      const current = Number(this.memory.get(key)?.value ?? '0') + 1;
      this.setMemoryValue(key, String(current));
      return current;
    }

    return this.client.incr(key);
  }

  async incrWithTTL(key: string, ttlSeconds?: number): Promise<number> {
    if (!this.client) {
      this.purgeExpired(key);
      const current = Number(this.memory.get(key)?.value ?? '0') + 1;
      const expiresAt =
        current === 1 && ttlSeconds
          ? this.nowMs() + ttlSeconds * 1000
          : this.memory.get(key)?.expiresAt;
      this.memory.set(key, { value: String(current), expiresAt });
      return current;
    }

    const current = await this.client.incr(key);
    if (current === 1 && ttlSeconds) {
      await this.client.expire(key, ttlSeconds);
    }
    return current;
  }

  async expire(key: string, ttl: number) {
    if (!this.client) {
      this.purgeExpired(key);
      const entry = this.memory.get(key);
      if (!entry) {
        return 0;
      }

      entry.expiresAt = this.nowMs() + ttl * 1000;
      this.memory.set(key, entry);
      return 1;
    }

    return this.client.expire(key, ttl);
  }

  async ttl(key: string) {
    if (!this.client) {
      this.purgeExpired(key);
      const entry = this.memory.get(key);
      if (!entry) {
        return -2;
      }

      if (!entry.expiresAt) {
        return -1;
      }

      const remainingSeconds = Math.ceil((entry.expiresAt - this.nowMs()) / 1000);
      return Math.max(remainingSeconds, 0);
    }

    return this.client.ttl(key);
  }
}

export default new CacheService();
