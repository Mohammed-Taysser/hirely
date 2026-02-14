export interface GetFailedBillingWebhookEventsRequestDto {
  userId: string;
  page: number;
  limit: number;
}

export interface GetFailedBillingWebhookEventsResponseDto {
  events: Array<{
    id: string;
    provider: string;
    eventId: string;
    eventType: string;
    status: 'FAILED';
    error: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
  total: number;
}
