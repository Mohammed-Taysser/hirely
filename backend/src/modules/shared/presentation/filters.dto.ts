import { z } from 'zod';

import type { BasePaginationInput, DateRangeInput } from '@/modules/shared/application/filters';

const basePaginationSchema = z.object({
  page: z.coerce.number().positive().positive().int().default(1),
  limit: z.coerce.number().positive().int().max(500).default(10),
});

const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

type BasePaginationSchemaType = z.infer<typeof basePaginationSchema>;
type DateRangeSchemaType = z.infer<typeof dateRangeSchema>;

type EnsureAssignable<Source extends Target, Target> = Source;
export type BasePaginationSchemaContract = EnsureAssignable<
  BasePaginationSchemaType,
  BasePaginationInput
>;
export type DateRangeSchemaContract = EnsureAssignable<DateRangeSchemaType, DateRangeInput>;

export type { BasePaginationInput, DateRangeInput };
export { basePaginationSchema, dateRangeSchema };
