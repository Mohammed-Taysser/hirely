import { z } from 'zod';

const getExportOpsMetricsSchema = {
  query: z.object({
    hours: z.coerce
      .number()
      .int()
      .positive()
      .max(24 * 30)
      .default(24),
  }),
};

const systemDTO = {
  getExportOpsMetrics: getExportOpsMetricsSchema,
};

export type SystemDTO = {
  getExportOpsMetrics: typeof getExportOpsMetricsSchema;
};

export default systemDTO;
