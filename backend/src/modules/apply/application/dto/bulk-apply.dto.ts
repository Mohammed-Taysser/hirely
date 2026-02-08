import { z } from 'zod';

const recipientSchema = z.object({
  email: z.string().email(),
  name: z.string().trim().min(1).optional(),
});

const bulkApplySchema = z.object({
  resumeId: z.string().uuid(),
  recipients: z.array(recipientSchema).min(1),
});

type BulkApplyInput = z.infer<typeof bulkApplySchema>;
type BulkApplyRecipient = z.infer<typeof recipientSchema>;

export { bulkApplySchema };
export type { BulkApplyInput, BulkApplyRecipient };
