import { z } from 'zod';

import { basePaginationSchema, dateRangeSchema } from '@/modules/shared/presentation/filters.dto';

const getUsersListSchema = {
  query: basePaginationSchema.extend({
    name: z.string().trim().min(3).max(100).optional(),
    email: z.string().trim().max(100).optional(),
    createdAt: dateRangeSchema.optional(),
  }),
};

const getUserByIdSchema = {
  params: z.object({
    userId: z.uuid(),
  }),
};

const createUserSchema = {
  body: z.object({
    name: z.string().trim().min(5).max(100),
    email: z.email().trim().max(100),
    password: z.string().trim().min(6).max(100),
  }),
};

const updateUserSchema = {
  params: getUserByIdSchema.params,
  body: z.object({
    name: z.string().trim().min(5).max(100).optional(),
    email: z.email().trim().max(100).optional(),
  }),
};

const changeUserPlanSchema = {
  params: getUserByIdSchema.params,
  body: z.object({
    planCode: z.string().trim().min(2).max(50),
    scheduleAt: z.string().datetime().optional(),
  }),
};

const userDTO = {
  createUser: createUserSchema,
  getUsersList: getUsersListSchema,
  getUserById: getUserByIdSchema,
  updateUser: updateUserSchema,
  changeUserPlan: changeUserPlanSchema,
};

export type UserDTO = {
  createUser: typeof createUserSchema;
  getUsersList: typeof getUsersListSchema;
  getUserById: typeof getUserByIdSchema;
  updateUser: typeof updateUserSchema;
  changeUserPlan: typeof changeUserPlanSchema;
};

export default userDTO;
