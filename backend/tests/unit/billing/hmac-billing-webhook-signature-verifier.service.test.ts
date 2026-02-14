import crypto from 'crypto';

import { HmacBillingWebhookSignatureVerifierService } from '@dist/modules/billing/infrastructure/services/hmac-billing-webhook-signature-verifier.service';

const hmac = (secret: string, payload: string) =>
  crypto.createHmac('sha256', secret).update(payload).digest('hex');

describe('HmacBillingWebhookSignatureVerifierService', () => {
  it('verifies mock provider signature', async () => {
    const secret = 'mock-secret';
    const rawBody = JSON.stringify({ eventId: 'evt_1' });
    const signature = hmac(secret, rawBody);

    const verifier = new HmacBillingWebhookSignatureVerifierService({ fallback: secret });
    const result = await verifier.verify({
      provider: 'mock',
      rawBody,
      headers: {
        'x-billing-webhook-signature': signature,
      },
    });

    expect(result.isValid).toBe(true);
    expect(result.signature).toBe(signature);
  });

  it('rejects mismatched mock signature', async () => {
    const verifier = new HmacBillingWebhookSignatureVerifierService({ fallback: 'mock-secret' });
    const result = await verifier.verify({
      provider: 'mock',
      rawBody: JSON.stringify({ eventId: 'evt_1' }),
      headers: {
        'x-billing-webhook-signature': 'wrong',
      },
    });

    expect(result.isValid).toBe(false);
  });

  it('verifies stripe signature with timestamped payload', async () => {
    const secret = 'stripe-secret';
    const rawBody = JSON.stringify({ eventId: 'evt_1' });
    const timestamp = `${Math.floor(Date.now() / 1000)}`;
    const payload = `${timestamp}.${rawBody}`;
    const signature = hmac(secret, payload);

    const verifier = new HmacBillingWebhookSignatureVerifierService({ stripe: secret });
    const result = await verifier.verify({
      provider: 'stripe',
      rawBody,
      headers: {
        'stripe-signature': `t=${timestamp},v1=${signature}`,
      },
    });

    expect(result.isValid).toBe(true);
  });
});
