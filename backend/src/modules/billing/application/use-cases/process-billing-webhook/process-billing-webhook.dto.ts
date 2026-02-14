export type BillingWebhookProvider = 'stripe' | 'paddle' | 'mock';
export type BillingWebhookEventType =
  | 'subscription.renewed'
  | 'subscription.canceled'
  | 'subscription.past_due';

export interface ProcessBillingWebhookRequestDto {
  eventId: string;
  provider: BillingWebhookProvider;
  type: BillingWebhookEventType;
  userId: string;
  signature: string | null;
  subscriptionId?: string;
  planCode?: string;
  fallbackPlanCode?: string;
  effectiveAt?: string;
  metadata?: Record<string, unknown>;
  payload: Record<string, unknown>;
}

export interface ProcessBillingWebhookResponseDto {
  eventId: string;
  applied: 'none' | 'planChanged' | 'planScheduled';
  replayed: boolean;
}
