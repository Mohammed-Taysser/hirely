import { z } from 'zod';

const exportStatusSchema = {
  params: z.object({
    exportId: z.uuid(),
  }),
};

export type ExportDTO = {
  exportStatus: typeof exportStatusSchema;
};

export default {
  exportStatus: exportStatusSchema,
};
