import { BillingWebhookProvider } from '@/modules/billing/application/use-cases/process-billing-webhook/process-billing-webhook.dto';

export interface BillingWebhookSignatureVerifyInput {
  provider: BillingWebhookProvider;
  rawBody: string;
  headers: Record<string, string | undefined>;
}

export interface BillingWebhookSignatureVerifyResult {
  isValid: boolean;
  signature: string | null;
  reason?: string;
}

export interface IBillingWebhookSignatureVerifierService {
  verify(input: BillingWebhookSignatureVerifyInput): Promise<BillingWebhookSignatureVerifyResult>;
}
