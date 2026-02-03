import { config } from 'dotenv';
import { SignOptions } from 'jsonwebtoken';
import { z } from 'zod';

// Load environment-specific .env file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
config({ path: envFile, debug: false });

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

const envSchema = z.object({
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
