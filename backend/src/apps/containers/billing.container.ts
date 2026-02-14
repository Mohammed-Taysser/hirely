import {
  auditLogService,
  billingWebhookEventRepository,
  planQueryRepository,
  systemLogService,
  userPlanCommandRepository,
  userQueryRepository,
  webhookSignatureVerifierService,
} from '@/apps/container.shared';
import { GetFailedBillingWebhookEventsUseCase } from '@/modules/billing/application/use-cases/get-failed-billing-webhook-events/get-failed-billing-webhook-events.use-case';
import { ProcessBillingWebhookUseCase } from '@/modules/billing/application/use-cases/process-billing-webhook/process-billing-webhook.use-case';
import { ReplayFailedBillingWebhookEventUseCase } from '@/modules/billing/application/use-cases/replay-failed-billing-webhook-event/replay-failed-billing-webhook-event.use-case';

const processBillingWebhookUseCase = new ProcessBillingWebhookUseCase(
  userQueryRepository,
  userPlanCommandRepository,
  billingWebhookEventRepository,
  planQueryRepository,
  systemLogService,
  auditLogService
);
const getFailedBillingWebhookEventsUseCase = new GetFailedBillingWebhookEventsUseCase(
  billingWebhookEventRepository
);
const replayFailedBillingWebhookEventUseCase = new ReplayFailedBillingWebhookEventUseCase(
  billingWebhookEventRepository,
  processBillingWebhookUseCase,
  systemLogService,
  auditLogService
);

const billingContainer = {
  getFailedBillingWebhookEventsUseCase,
  processBillingWebhookUseCase,
  replayFailedBillingWebhookEventUseCase,
  webhookSignatureVerifierService,
};

export { billingContainer };
