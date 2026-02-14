export interface ReplayFailedBillingWebhookEventRequestDto {
  userId: string;
  webhookEventId: string;
}

export interface ReplayFailedBillingWebhookEventResponseDto {
  webhookEventId: string;
  eventId: string;
  applied: 'none' | 'planChanged' | 'planScheduled';
  replayed: boolean;
}
