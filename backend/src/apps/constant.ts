const BODY_LIMIT: string | number = '300kb';

const EXPORT_EXPIRY_DAYS_FREE = 30;
const EXPORT_EXPIRY_DAYS_PAID = 90;

// Map of endpoints or actions to their limits
const RATE_LIMITS: Record<RateLimitKeys, RateLimitConfig> = {
  EXPORT: { windowSeconds: 60, max: 5, keyTemplate: 'redis:rate-limit:export:user:{userId}' },
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
  GENERAL: { windowSeconds: 60, max: 500, keyTemplate: 'redis:rate-limit:ip:{req.ip}' },
};

const QUEUE_NAMES = {
  pdf: 'pdf-generation',
  email: 'email-delivery',
};

export { BODY_LIMIT, EXPORT_EXPIRY_DAYS_FREE, EXPORT_EXPIRY_DAYS_PAID, QUEUE_NAMES, RATE_LIMITS };
