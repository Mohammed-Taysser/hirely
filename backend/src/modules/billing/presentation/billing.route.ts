import { Router } from 'express';

import {
  getFailedBillingWebhookEvents,
  processBillingWebhook,
  replayFailedBillingWebhookEvent,
} from './billing.controller';
import billingDTO from './billing.dto';

import authenticateMiddleware from '@/middleware/authenticate.middleware';
import validateRequest from '@/middleware/validate-request.middleware';

const billingRoutes = Router();

billingRoutes.post(
  '/webhooks/events',
  validateRequest(billingDTO.processBillingWebhook),
  processBillingWebhook
);
billingRoutes.get(
  '/webhooks/failed',
  authenticateMiddleware,
  validateRequest(billingDTO.getFailedBillingWebhookEvents),
  getFailedBillingWebhookEvents
);
billingRoutes.post(
  '/webhooks/failed/:webhookEventId/replay',
  authenticateMiddleware,
  validateRequest(billingDTO.replayFailedBillingWebhookEvent),
  replayFailedBillingWebhookEvent
);

export default billingRoutes;
