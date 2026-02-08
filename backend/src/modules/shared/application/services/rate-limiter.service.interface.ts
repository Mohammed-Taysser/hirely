export interface RateLimitRequest {
  key: string;
  max: number;
  windowSeconds: number;
}

export interface IRateLimiter {
  consume(request: RateLimitRequest): Promise<boolean>;
}
