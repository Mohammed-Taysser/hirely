import { Request, Response } from 'express';

import type { BillingDTO } from './billing.dto';

import { billingContainer } from '@/apps/container';
import { mapAppErrorToHttp } from '@/modules/shared/presentation/app-error.mapper';
import errorService from '@/modules/shared/presentation/error.service';
import { TypedAuthenticatedRequest } from '@/modules/shared/presentation/import';
import responseService from '@/modules/shared/presentation/response.service';

const { processBillingWebhookUseCase, webhookSignatureVerifierService } = billingContainer;
const { getFailedBillingWebhookEventsUseCase, replayFailedBillingWebhookEventUseCase } =
  billingContainer;

const normalizeHeaders = (request: Request): Record<string, string | undefined> => {
  const normalized: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(request.headers)) {
    if (Array.isArray(value)) {
      normalized[key.toLowerCase()] = value.join(',');
    } else {
      normalized[key.toLowerCase()] = value;
    }
  }

  return normalized;
};

async function processBillingWebhook(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<BillingDTO['processBillingWebhook']>;
  const body = request.parsedBody;
  const rawBody = request.rawBody ?? JSON.stringify(body);
  if (!rawBody) {
    throw errorService.badRequest('Missing webhook payload');
  }

  const verification = await webhookSignatureVerifierService.verify({
    provider: body.provider,
    rawBody,
    headers: normalizeHeaders(req),
  });
  if (!verification.isValid) {
    const reason = verification.reason ?? 'Invalid webhook signature';
    throw errorService.unauthorized(reason);
  }

  const result = await processBillingWebhookUseCase.execute({
    ...body,
    signature: verification.signature,
    payload: body,
  });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  responseService.success(response, {
    message: 'Billing webhook processed successfully',
    data: result.getValue(),
  });
}

async function getFailedBillingWebhookEvents(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<BillingDTO['getFailedBillingWebhookEvents']>;
  const result = await getFailedBillingWebhookEventsUseCase.execute({
    userId: request.user.id,
    page: request.parsedQuery.page,
    limit: request.parsedQuery.limit,
  });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  const { events, total } = result.getValue();

  responseService.paginated(response, {
    message: 'Failed billing webhook events fetched successfully',
    data: events,
    metadata: {
      total,
      page: request.parsedQuery.page,
      limit: request.parsedQuery.limit,
      totalPages: Math.ceil(total / request.parsedQuery.limit),
    },
  });
}

async function replayFailedBillingWebhookEvent(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<BillingDTO['replayFailedBillingWebhookEvent']>;
  const result = await replayFailedBillingWebhookEventUseCase.execute({
    userId: request.user.id,
    webhookEventId: request.parsedParams.webhookEventId,
  });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  responseService.success(response, {
    message: 'Failed billing webhook event replayed successfully',
    data: result.getValue(),
  });
}

export { getFailedBillingWebhookEvents, processBillingWebhook, replayFailedBillingWebhookEvent };
