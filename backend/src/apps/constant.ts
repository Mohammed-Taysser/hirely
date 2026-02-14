export type RateLimitKeys =
  | 'EXPORT'
  | 'EXPORT_RETRY'
  | 'EXPORT_EMAIL_RETRY'
  | 'BULK_APPLY'
  | 'LOGIN'
  | 'REGISTER'
  | 'REFRESH_TOKEN'
  | 'RESET_PASSWORD'
  | 'CHANGE_PASSWORD'
  | 'CHANGE_EMAIL'
  | 'GENERAL';

export interface RateLimitConfig {
  windowSeconds: number;
  max: number;
  keyTemplate: string;
}

const BODY_LIMIT: string | number = '300kb';

// Map of endpoints or actions to their limits
const RATE_LIMITS: Record<RateLimitKeys, RateLimitConfig> = {
  EXPORT: { windowSeconds: 60, max: 5, keyTemplate: 'redis:rate-limit:export:user:{userId}' },
  EXPORT_RETRY: {
    windowSeconds: 60 * 60,
    max: 10,
    keyTemplate: 'redis:rate-limit:export-retry:user:{userId}',
  },
  EXPORT_EMAIL_RETRY: {
    windowSeconds: 60 * 60,
    max: 10,
    keyTemplate: 'redis:rate-limit:export-email-retry:user:{userId}',
  },
  BULK_APPLY: {
    windowSeconds: 60,
    max: 2,
    keyTemplate: 'redis:rate-limit:bulk-apply:user:{userId}',
  },
  LOGIN: { windowSeconds: 60, max: 5, keyTemplate: 'redis:rate-limit:login:user:{userId}' },
  REGISTER: { windowSeconds: 60, max: 5, keyTemplate: 'redis:rate-limit:register:user:{userId}' },
  REFRESH_TOKEN: {
    windowSeconds: 60,
    max: 5,
    keyTemplate: 'redis:rate-limit:refresh:user:{userId}',
  },
  RESET_PASSWORD: {
    windowSeconds: 60,
    max: 5,
    keyTemplate: 'redis:rate-limit:reset-password:user:{userId}',
  },
  CHANGE_PASSWORD: {
    windowSeconds: 60,
    max: 5,
    keyTemplate: 'redis:rate-limit:change-password:user:{userId}',
  },
  CHANGE_EMAIL: {
    windowSeconds: 60,
    max: 5,
    keyTemplate: 'redis:rate-limit:change-email:user:{userId}',
  },
  GENERAL: { windowSeconds: 60, max: 500, keyTemplate: 'redis:rate-limit:ip:{ip}' },
};

const QUEUE_NAMES = {
  pdf: 'pdf-generation',
  email: 'email-delivery',
  planChanges: 'plan-changes',
  exportCleanup: 'export-cleanup',
};

export { BODY_LIMIT, QUEUE_NAMES, RATE_LIMITS };
