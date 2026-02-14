import { z } from 'zod';

import { basePaginationSchema } from '@/modules/shared/presentation/filters.dto';

const processBillingWebhookSchema = {
  body: z.object({
    eventId: z.string().trim().min(8).max(128),
    provider: z.enum(['stripe', 'paddle', 'mock']),
    type: z.enum(['subscription.renewed', 'subscription.canceled', 'subscription.past_due']),
    userId: z.uuid(),
    subscriptionId: z.string().trim().min(1).max(191).optional(),
    planCode: z.string().trim().min(2).max(50).optional(),
    fallbackPlanCode: z.string().trim().min(2).max(50).optional(),
    effectiveAt: z.string().datetime().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  }),
};

const getFailedBillingWebhookEventsSchema = {
  query: basePaginationSchema,
};

const replayFailedBillingWebhookEventSchema = {
  params: z.object({
    webhookEventId: z.uuid(),
  }),
};

const billingDTO = {
  processBillingWebhook: processBillingWebhookSchema,
  getFailedBillingWebhookEvents: getFailedBillingWebhookEventsSchema,
  replayFailedBillingWebhookEvent: replayFailedBillingWebhookEventSchema,
};

export type BillingDTO = {
  processBillingWebhook: typeof processBillingWebhookSchema;
  getFailedBillingWebhookEvents: typeof getFailedBillingWebhookEventsSchema;
  replayFailedBillingWebhookEvent: typeof replayFailedBillingWebhookEventSchema;
};

export default billingDTO;
