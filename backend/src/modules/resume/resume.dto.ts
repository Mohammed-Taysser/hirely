import { z } from 'zod';

import CONFIG from '@/apps/config';
import { basePaginationSchema, dateRangeSchema } from '@/modules/shared/dto/filters.dto';

/* -----------------------
 * Section schemas
 * ----------------------- */
const summarySection = z.object({
  type: z.literal('summary'),
  content: z.object({
    text: z.string().min(1),
  }),
});

const experienceSection = z.object({
  type: z.literal('experience'),
  content: z
    .object({
      company: z.string().min(1),
      role: z.string().min(1),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
    })
    .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
      message: 'endDate must be after startDate',
    }),
});

const sectionSchema = z.discriminatedUnion('type', [summarySection, experienceSection]);

/* -----------------------
 * Resume data schema
 * ----------------------- */
const resumeDataSchema = z
  .object({
    meta: z.object({
      title: z.string().min(1),
      language: z.string().optional(),
    }),
    sections: z.record(z.string(), sectionSchema),
  })
  .refine((data) => Object.keys(data.sections).length <= CONFIG.MAX_RESUME_SECTIONS, {
    message: `Max sections per resume is ${CONFIG.MAX_RESUME_SECTIONS}`,
  });

const getResumesListSchema = {
  query: basePaginationSchema.extend({
    name: z.string().trim().min(3).max(100).optional(),
    userId: z.uuid().optional(),
    createdAt: dateRangeSchema.optional(),
  }),
};

const getResumeByIdSchema = {
  params: z.object({
    resumeId: z.uuid(),
  }),
};

const getResumeSnapshotsSchema = {
  params: getResumeByIdSchema.params,
  query: basePaginationSchema.extend({
    createdAt: dateRangeSchema.optional(),
  }),
};

const getResumeExportsSchema = {
  params: getResumeByIdSchema.params,
  query: basePaginationSchema.extend({
    createdAt: dateRangeSchema.optional(),
    status: z.enum(['PENDING', 'READY', 'FAILED']).optional(),
  }),
};

const exportResumeSchema = {
  params: getResumeByIdSchema.params,
};

const enqueueExportSchema = {
  params: getResumeByIdSchema.params,
  body: z.object({
    store: z.boolean().default(true),
  }),
};

const getResumeExportStatusSchema = {
  params: z.object({
    resumeId: z.uuid(),
    exportId: z.uuid(),
  }),
};

const createResumeSchema = {
  body: z.object({
    name: z.string().trim().min(1).max(200),
    data: resumeDataSchema,
    templateId: z.string().trim().min(1).max(100).default('classic'),
    templateVersion: z.string().trim().max(50).optional(),
    themeConfig: z.record(z.string(), z.any()).optional(),
  }),
};

const updateResumeSchema = {
  params: getResumeByIdSchema.params,
  body: z
    .object({
      name: z.string().trim().min(1).max(200).optional(),
      data: resumeDataSchema.optional(),
      templateId: z.string().trim().min(1).max(100).optional(),
      templateVersion: z.string().trim().max(50).optional(),
      themeConfig: z.record(z.string(), z.any()).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
};

const resumeDTO = {
  createResume: createResumeSchema,
  getResumesList: getResumesListSchema,
  getResumeById: getResumeByIdSchema,
  getResumeSnapshots: getResumeSnapshotsSchema,
  getResumeExports: getResumeExportsSchema,
  exportResume: exportResumeSchema,
  enqueueExport: enqueueExportSchema,
  getResumeExportStatus: getResumeExportStatusSchema,
  updateResume: updateResumeSchema,
};

export type ResumeDTO = {
  createResume: typeof createResumeSchema;
  getResumesList: typeof getResumesListSchema;
  getResumeById: typeof getResumeByIdSchema;
  getResumeSnapshots: typeof getResumeSnapshotsSchema;
  getResumeExports: typeof getResumeExportsSchema;
  exportResume: typeof exportResumeSchema;
  enqueueExport: typeof enqueueExportSchema;
  getResumeExportStatus: typeof getResumeExportStatusSchema;
  updateResume: typeof updateResumeSchema;
};

export default resumeDTO;
