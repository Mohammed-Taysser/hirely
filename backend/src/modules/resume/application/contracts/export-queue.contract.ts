import { z } from 'zod';

import { BulkApplyEmailJob } from '@/modules/resume/application/services/bulk-apply-email-queue.service.interface';
import { ExportEmailJob } from '@/modules/resume/application/services/export-email-queue.service.interface';
import { ExportQueueJob } from '@/modules/resume/application/services/export-queue.service.interface';

const nonEmptyString = z.string().trim().min(1);
const recipientSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    company: z.string().trim().min(1).optional(),
    message: z.string().trim().min(1).optional(),
  })
  .strict();

export const pdfExportQueuePayloadSchema: z.ZodType<ExportQueueJob> = z
  .object({
    exportId: nonEmptyString,
    snapshotId: nonEmptyString,
    userId: nonEmptyString,
  })
  .strict();

export const freeTierExportEmailQueuePayloadSchema = z
  .object({
    exportId: nonEmptyString,
    userId: nonEmptyString,
    to: z.string().trim().email(),
    reason: z.literal('free-tier-export'),
    recipient: recipientSchema.optional(),
  })
  .strict();

export const bulkApplyEmailQueuePayloadSchema = z
  .object({
    exportId: nonEmptyString,
    userId: nonEmptyString,
    to: z.string().trim().email(),
    reason: z.literal('bulk-apply'),
    recipient: recipientSchema
      .extend({
        email: z.string().trim().email(),
      })
      .strict(),
  })
  .strict();

export const exportEmailQueuePayloadSchema = z.discriminatedUnion('reason', [
  freeTierExportEmailQueuePayloadSchema,
  bulkApplyEmailQueuePayloadSchema,
]);

export const parsePdfExportQueuePayload = (payload: unknown): ExportQueueJob =>
  pdfExportQueuePayloadSchema.parse(payload);

export const parseFreeTierExportEmailQueuePayload = (payload: unknown): ExportEmailJob =>
  freeTierExportEmailQueuePayloadSchema.parse(payload);

export const parseBulkApplyEmailQueuePayload = (payload: unknown): BulkApplyEmailJob =>
  bulkApplyEmailQueuePayloadSchema.parse(payload);

export const parseExportEmailQueuePayload = (
  payload: unknown
): ExportEmailJob | BulkApplyEmailJob => exportEmailQueuePayloadSchema.parse(payload);
