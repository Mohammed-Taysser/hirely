import { z } from 'zod';

const registerSchema = {
  body: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.email().max(100),
    password: z.string().trim().min(6).max(100),
  }),
};

const loginSchema = {
  body: z.object({
    email: z.email().max(100),
    password: z.string().trim().min(6).max(100),
  }),
};

const refreshTokenSchema = {
  body: z.object({
    refreshToken: z.string().trim(),
  }),
};

const switchUserSchema = {
  body: z.object({
    userId: z.uuid(),
  }),
};

const authDTO = {
  login: loginSchema,
  refreshToken: refreshTokenSchema,
  register: registerSchema,
  switchUser: switchUserSchema,
};

export type AuthDTO = {
  login: typeof loginSchema;
  refreshToken: typeof refreshTokenSchema;
  register: typeof registerSchema;
  switchUser: typeof switchUserSchema;
};

export default authDTO;
