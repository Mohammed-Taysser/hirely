import { config } from 'dotenv';
import { SignOptions } from 'jsonwebtoken';
import { z } from 'zod';

// Load environment-specific .env file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
config({
  path: envFile,
  debug: false,
  quiet: process.env.NODE_ENV === 'test',
});

/* ----------------------------- Shared Schemas ----------------------------- */

const durationSchema = z
  .string()
  .trim()
  .regex(/^\d+[smhd]$/, {
    message: 'Duration must be like "30s", "15m", "1h", "7d"',
  }) as z.ZodType<SignOptions['expiresIn']>;

const postgresUrlSchema = z
  .string()
  .trim()
  .refine((val) => val.startsWith('postgres://') || val.startsWith('postgresql://'), {
    message: 'DATABASE_URL must start with "postgres://" or "postgresql://"',
  });

/* ------------------------------- Env Schema ------------------------------- */

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().positive().int(),

    ALLOWED_ORIGINS: z
      .string()
      .trim()
      .default('')
      .transform((v) =>
        z.array(z.url()).parse(
          v
            .split(',')
            .map((x) => x.trim())
            .filter(Boolean)
        )
      ),

    // Database Configuration
    DATABASE_URL: postgresUrlSchema,

    // Seed Configuration
    SEED_USER_PASSWORD: z.string().trim(),

    // JWT Configuration
    JWT_SECRET: z.string().trim().min(10),
    JWT_ACCESS_EXPIRES_IN: durationSchema,
    JWT_REFRESH_EXPIRES_IN: durationSchema,

    // Redis Configuration
    REDIS_HOST: z.string().trim(),
    REDIS_PORT: z.coerce.number().positive().int(),

    // Gotenberg Configuration
    GOTENBERG_URL: z.url(),

    // Resume limits
    MAX_RESUME_SECTIONS: z.coerce.number().int().positive().max(50).default(20),

    // Scheduled plan changes
    PLAN_CHANGE_INTERVAL_SECONDS: z.coerce.number().int().positive().default(300),

    // Export workers and retries
    EXPORT_CLEANUP_INTERVAL_SECONDS: z.coerce.number().int().positive().default(3600),
    EXPORT_CLEANUP_BATCH_SIZE: z.coerce.number().int().positive().default(100),
    EXPORT_CLEANUP_DRY_RUN: z
      .string()
      .trim()
      .optional()
      .transform((value) => value?.toLowerCase() === 'true')
      .default(false),
    EXPORT_ALERT_WINDOW_MINUTES: z.coerce.number().int().positive().default(60),
    EXPORT_ALERT_MIN_EVENTS: z.coerce.number().int().positive().default(20),
    EXPORT_ALERT_FAILURE_RATIO: z.coerce.number().min(0).max(1).default(0.25),
    EXPORT_ALERT_COOLDOWN_SECONDS: z.coerce.number().int().positive().default(900),
    EXPORT_JOB_ATTEMPTS: z.coerce.number().int().positive().default(3),
    EXPORT_JOB_BACKOFF_MS: z.coerce.number().int().positive().default(10000),
    EXPORT_JOB_KEEP_COMPLETED: z.coerce.number().int().positive().default(1000),
    EXPORT_JOB_KEEP_FAILED: z.coerce.number().int().positive().default(1000),

    // Email configuration
    MAIL_FROM: z.string().trim().default('no-reply@hirely.app'),
    SMTP_HOST: z.string().trim().optional(),
    SMTP_PORT: z.coerce.number().positive().int().optional(),
    SMTP_USER: z.string().trim().optional(),
    SMTP_PASS: z.string().trim().optional(),

    // Export storage configuration
    EXPORT_STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
    S3_BUCKET: z.string().trim().optional(),
    S3_REGION: z.string().trim().optional(),
    S3_ACCESS_KEY_ID: z.string().trim().optional(),
    S3_SECRET_ACCESS_KEY: z.string().trim().optional(),
    S3_ENDPOINT: z.url().optional(),
    S3_FORCE_PATH_STYLE: z
      .string()
      .trim()
      .optional()
      .transform((value) => value?.toLowerCase() === 'true')
      .default(false),
  })
  .superRefine((data, ctx) => {
    const missingSmtpField =
      !data.SMTP_HOST || !data.SMTP_PORT || !data.SMTP_USER || !data.SMTP_PASS;
    if (data.NODE_ENV === 'production' && missingSmtpField) {
      ctx.addIssue({
        code: 'custom',
        path: ['SMTP_HOST'],
        message: 'SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS are required in production.',
      });
    }

    if (data.EXPORT_STORAGE_DRIVER === 's3') {
      const missingS3Field =
        !data.S3_BUCKET || !data.S3_REGION || !data.S3_ACCESS_KEY_ID || !data.S3_SECRET_ACCESS_KEY;

      if (missingS3Field) {
        ctx.addIssue({
          code: 'custom',
          path: ['EXPORT_STORAGE_DRIVER'],
          message:
            'S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY are required when EXPORT_STORAGE_DRIVER=s3.',
        });
      }
    }
  });

/* ----------------------------- Validate Config ---------------------------- */

// Validate and catch errors with friendly messages
const envValidation = envSchema.safeParse(process.env);

if (!envValidation.success) {
  console.error('❌ Environment variable validation failed:\n');

  if (envValidation.error instanceof z.ZodError) {
    for (const issue of envValidation.error.issues) {
      console.error(`• ${issue.path.join('.')}: ${issue.message}`);
    }
  } else {
    console.error(envValidation.error);
  }

  process.exit(1); // Exit with failure
}

if (envValidation.data.ALLOWED_ORIGINS.length === 0 && envValidation.data.NODE_ENV !== 'test') {
  console.warn('\n⚠️  ALLOWED_ORIGINS is empty, CORS is disabled \n');
}

const CONFIG = envValidation.data;

export default CONFIG;
