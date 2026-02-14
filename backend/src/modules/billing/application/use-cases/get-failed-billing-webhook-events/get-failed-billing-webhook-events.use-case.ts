import {
  GetFailedBillingWebhookEventsRequestDto,
  GetFailedBillingWebhookEventsResponseDto,
} from './get-failed-billing-webhook-events.dto';

import { IBillingWebhookEventRepository } from '@/modules/billing/application/repositories/billing-webhook-event.repository.interface';
import { UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';

type GetFailedBillingWebhookEventsResponse = Result<
  GetFailedBillingWebhookEventsResponseDto,
  UnexpectedError
>;

export class GetFailedBillingWebhookEventsUseCase implements UseCase<
  GetFailedBillingWebhookEventsRequestDto,
  GetFailedBillingWebhookEventsResponse
> {
  constructor(private readonly billingWebhookEventRepository: IBillingWebhookEventRepository) {}

  async execute(
    request: GetFailedBillingWebhookEventsRequestDto
  ): Promise<GetFailedBillingWebhookEventsResponse> {
    try {
      const { events, total } = await this.billingWebhookEventRepository.getFailedByUser(
        request.userId,
        request.page,
        request.limit
      );

      return Result.ok({
        events: events.map((event) => ({
          id: event.id,
          provider: event.provider,
          eventId: event.eventId,
          eventType: event.eventType,
          status: 'FAILED',
          error: event.error,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
        })),
        total,
      });
    } catch (error) {
      return Result.fail(new UnexpectedError(error));
    }
  }
}
