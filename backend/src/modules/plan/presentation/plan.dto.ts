import { z } from 'zod';

import { basePaginationSchema, dateRangeSchema } from '@/modules/shared/presentation/filters.dto';

const getPlansSchema = {
  query: basePaginationSchema.extend({
    code: z.string().trim().min(2).max(50).optional(),
    name: z.string().trim().min(2).max(100).optional(),
    createdAt: dateRangeSchema.optional(),
  }),
};

const getPlanByIdSchema = {
  params: z.object({
    planId: z.uuid(),
  }),
};

const createPlanSchema = {
  body: z.object({
    code: z.string().trim().min(2).max(50),
    name: z.string().trim().min(2).max(100),
    description: z.string().trim().max(500).optional(),
    limits: z.object({
      maxResumes: z.number().int().min(0),
      maxExports: z.number().int().min(0),
      dailyUploadMb: z.number().int().min(0),
    }),
  }),
};

const updatePlanSchema = {
  params: getPlanByIdSchema.params,
  body: z
    .object({
      code: z.string().trim().min(2).max(50).optional(),
      name: z.string().trim().min(2).max(100).optional(),
      description: z.string().trim().max(500).optional(),
      limits: z
        .object({
          maxResumes: z.number().int().min(0).optional(),
          maxExports: z.number().int().min(0).optional(),
          dailyUploadMb: z.number().int().min(0).optional(),
        })
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
};

const planDTO = {
  getPlans: getPlansSchema,
  getPlanById: getPlanByIdSchema,
  createPlan: createPlanSchema,
  updatePlan: updatePlanSchema,
};

export type PlanDTO = {
  getPlans: typeof getPlansSchema;
  getPlanById: typeof getPlanByIdSchema;
  createPlan: typeof createPlanSchema;
  updatePlan: typeof updatePlanSchema;
};

export default planDTO;
