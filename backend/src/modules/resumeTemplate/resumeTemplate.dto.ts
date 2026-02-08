import { z } from 'zod';

const listResumeTemplatesSchema = {
  query: z.object({}).optional(),
};

const resumeTemplateDTO = {
  listResumeTemplates: listResumeTemplatesSchema,
};

export type ResumeTemplateDTO = {
  listResumeTemplates: typeof listResumeTemplatesSchema;
};

export default resumeTemplateDTO;
