import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for creation endpoints (discussions, operations)
 * Limits to 10 requests per minute to prevent spam
 */
export const creationRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    success: false,
    message: 'Too many creation requests. Please try again in a minute.',
    statusCode: 429,
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  // Skip rate limiting for certain conditions (e.g., trusted IPs)
  skip: () => {
    // Can add logic to skip rate limiting for trusted sources
    return false;
  },
});

/**
 * General API rate limiter
 * Limits to 100 requests per minute
 */
export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
