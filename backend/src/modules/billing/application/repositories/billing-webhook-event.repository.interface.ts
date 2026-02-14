export type BillingWebhookEventStatus = 'PROCESSING' | 'PROCESSED' | 'IGNORED' | 'FAILED';
export type BillingWebhookAppliedAction = 'none' | 'planChanged' | 'planScheduled';

export interface BillingWebhookEventRecord {
  id: string;
  provider: string;
  eventId: string;
  eventType: string;
  status: BillingWebhookEventStatus;
  appliedAction: BillingWebhookAppliedAction | null;
  error: string | null;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillingWebhookEventDetails extends BillingWebhookEventRecord {
  eventType: string;
  signature: string | null;
  payload: Record<string, unknown>;
}

export interface BeginBillingWebhookEventInput {
  provider: string;
  eventId: string;
  eventType: string;
  signature: string | null;
  payload: Record<string, unknown>;
  userId: string | null;
}

export interface BeginBillingWebhookEventResult {
  event: BillingWebhookEventRecord;
  isReplay: boolean;
  canProcess: boolean;
}

export interface IBillingWebhookEventRepository {
  begin(input: BeginBillingWebhookEventInput): Promise<BeginBillingWebhookEventResult>;
  markProcessed(
    id: string,
    appliedAction: BillingWebhookAppliedAction,
    metadata?: { processedAt?: Date }
  ): Promise<void>;
  markIgnored(id: string, reason?: string): Promise<void>;
  markFailed(id: string, error: string): Promise<void>;
  getFailedByUser(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ events: BillingWebhookEventRecord[]; total: number }>;
  findFailedByIdForUser(
    userId: string,
    eventId: string
  ): Promise<BillingWebhookEventDetails | null>;
}
