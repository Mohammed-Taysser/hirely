import crypto from 'crypto';

import CONFIG from '@/apps/config';
import {
  BillingWebhookSignatureVerifyInput,
  BillingWebhookSignatureVerifyResult,
  IBillingWebhookSignatureVerifierService,
} from '@/modules/billing/application/services/billing-webhook-signature-verifier.service.interface';

const toSafeBuffer = (value: string): Buffer => Buffer.from(value, 'utf8');

const safeEqual = (left: string, right: string): boolean => {
  const leftBuffer = toSafeBuffer(left);
  const rightBuffer = toSafeBuffer(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const hmacSha256Hex = (secret: string, payload: string): string =>
  crypto.createHmac('sha256', secret).update(payload).digest('hex');

const headerValue = (
  headers: Record<string, string | undefined>,
  headerName: string
): string | undefined => {
  const lower = headerName.toLowerCase();
  return headers[lower] ?? headers[headerName];
};

const parseStripeHeader = (
  rawHeader: string
): { timestamp: string; signatures: string[] } | null => {
  const parts = rawHeader.split(',').map((part) => part.trim());
  const timestamp = parts.find((part) => part.startsWith('t='))?.slice(2);
  const signatures = parts
    .filter((part) => part.startsWith('v1='))
    .map((part) => part.slice(3))
    .filter(Boolean);

  if (!timestamp || signatures.length === 0) {
    return null;
  }

  return { timestamp, signatures };
};

const verifyStripeSignature = (
  secret: string,
  input: BillingWebhookSignatureVerifyInput
): BillingWebhookSignatureVerifyResult => {
  const rawHeader = headerValue(input.headers, 'stripe-signature');
  if (!rawHeader) {
    return { isValid: false, signature: null, reason: 'Missing stripe-signature header' };
  }

  const parsed = parseStripeHeader(rawHeader);
  if (!parsed) {
    return { isValid: false, signature: rawHeader, reason: 'Invalid stripe-signature format' };
  }

  const timestampSeconds = Number(parsed.timestamp);
  if (!Number.isFinite(timestampSeconds)) {
    return { isValid: false, signature: rawHeader, reason: 'Invalid stripe timestamp' };
  }

  const maxAge = CONFIG.BILLING_WEBHOOK_TOLERANCE_SECONDS;
  const ageSeconds = Math.abs(Math.floor(Date.now() / 1000) - timestampSeconds);
  if (ageSeconds > maxAge) {
    return { isValid: false, signature: rawHeader, reason: 'Expired stripe signature timestamp' };
  }

  const signedPayload = `${parsed.timestamp}.${input.rawBody}`;
  const expected = hmacSha256Hex(secret, signedPayload);
  const matched = parsed.signatures.some((candidate) => safeEqual(candidate, expected));

  return {
    isValid: matched,
    signature: rawHeader,
    reason: matched ? undefined : 'Stripe signature mismatch',
  };
};

const verifySimpleSignature = (
  secret: string,
  input: BillingWebhookSignatureVerifyInput,
  signatureHeader: string
): BillingWebhookSignatureVerifyResult => {
  const rawSignature = headerValue(input.headers, signatureHeader);
  if (!rawSignature) {
    return { isValid: false, signature: null, reason: `Missing ${signatureHeader} header` };
  }

  const expected = hmacSha256Hex(secret, input.rawBody);
  const matched = safeEqual(rawSignature, expected);

  return {
    isValid: matched,
    signature: rawSignature,
    reason: matched ? undefined : `${signatureHeader} mismatch`,
  };
};

export class HmacBillingWebhookSignatureVerifierService implements IBillingWebhookSignatureVerifierService {
  private readonly fallbackSecret: string;
  private readonly stripeSecret: string;
  private readonly paddleSecret: string;

  constructor(secrets?: { fallback?: string; stripe?: string; paddle?: string }) {
    this.fallbackSecret = (secrets?.fallback ?? CONFIG.BILLING_WEBHOOK_SECRET).trim();
    this.stripeSecret = (secrets?.stripe ?? CONFIG.BILLING_STRIPE_WEBHOOK_SECRET).trim();
    this.paddleSecret = (secrets?.paddle ?? CONFIG.BILLING_PADDLE_WEBHOOK_SECRET).trim();
  }

  async verify(
    input: BillingWebhookSignatureVerifyInput
  ): Promise<BillingWebhookSignatureVerifyResult> {
    if (!input.rawBody) {
      return { isValid: false, signature: null, reason: 'Missing raw request body' };
    }

    if (input.provider === 'stripe') {
      const secret = this.stripeSecret || this.fallbackSecret;
      if (!secret) {
        return { isValid: false, signature: null, reason: 'Stripe webhook secret not configured' };
      }
      return verifyStripeSignature(secret, input);
    }

    if (input.provider === 'paddle') {
      const secret = this.paddleSecret || this.fallbackSecret;
      if (!secret) {
        return { isValid: false, signature: null, reason: 'Paddle webhook secret not configured' };
      }
      return verifySimpleSignature(secret, input, 'paddle-signature');
    }

    if (!this.fallbackSecret) {
      return { isValid: false, signature: null, reason: 'Mock webhook secret not configured' };
    }

    return verifySimpleSignature(this.fallbackSecret, input, 'x-billing-webhook-signature');
  }
}
