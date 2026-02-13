import { z } from 'zod';

import { AUDIT_ENTITY_TYPES } from '@/modules/audit/application/audit.entity';
import { basePaginationSchema } from '@/modules/shared/presentation/filters.dto';

const getAuditLogsSchema = {
  query: basePaginationSchema.extend({
    entityType: z.enum(AUDIT_ENTITY_TYPES),
    entityId: z.uuid(),
  }),
};

export type AuditDTO = {
  getAuditLogs: typeof getAuditLogsSchema;
};

export default {
  getAuditLogs: getAuditLogsSchema,
};
