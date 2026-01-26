import redis from '@/apps/redis';

interface CacheOptions {
  ttl?: number; // seconds
}

class CacheService {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.warn('[Cache][GET]', (error as Error).message);
      return null;
    }
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    try {
      const payload = JSON.stringify(value);

      if (options.ttl) {
        await redis.set(key, payload, 'EX', options.ttl);
      } else {
        await redis.set(key, payload);
      }
    } catch (error) {
      console.warn('[Cache][SET]', (error as Error).message);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.warn('[Cache][DEL]', (error as Error).message);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      return (await redis.exists(key)) === 1;
    } catch {
      return false;
    }
  }
}

export default new CacheService();
