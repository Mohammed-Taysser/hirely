type ErrorContent = string | Record<string, unknown> | unknown[];

interface UserTokenPayload {
  id: string;
  email: string;
}

type RateLimitKeys =
  | 'EXPORT'
  | 'BULK_APPLY'
  | 'LOGIN'
  | 'REGISTER'
  | 'REFRESH_TOKEN'
  | 'RESET_PASSWORD'
  | 'CHANGE_PASSWORD'
  | 'CHANGE_EMAIL'
  | 'GENERAL';

interface RateLimitConfig {
  windowSeconds: number;
  max: number;
  keyTemplate: string;
}
