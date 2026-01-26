import { z } from "zod";
import { canBulkApply } from "../billing/billing.policy";
import errorService from "@/modules/shared/services/error.service";
import { activityService } from "../activity/activity.service";

export const bulkApplySchema = z
  .object({
    resumeId: z.string().uuid(),
    recipients: z
      .array(
        z
          .object({
            email: z.string().email(),
            name: z.string().min(1).max(200).optional(),
            company: z.string().min(1).max(200).optional(),
            message: z.string().max(2000).optional(),
          })
          .strict(),
      )
      .min(1)
      .max(100),
  })
  .strict();

export type BulkApplyInput = z.infer<typeof bulkApplySchema>;

export const applyService = {
  ensureBulkApplyAllowed(planCode: string) {
    if (!canBulkApply(planCode)) {
      throw errorService.forbidden("Bulk apply is only available on Pro plans");
    }
  },

  async createBatch(userId: string, input: BulkApplyInput) {
    const metadata = {
      resumeId: input.resumeId,
      recipientCount: input.recipients.length,
    };

    const log = await activityService.log(userId, "bulk.apply.started", metadata);

    return {
      batchId: log.id,
    };
  },
};
