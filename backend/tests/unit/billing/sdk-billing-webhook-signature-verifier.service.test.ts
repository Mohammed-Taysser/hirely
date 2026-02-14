import { SdkBillingWebhookSignatureVerifierService } from '@dist/modules/billing/infrastructure/services/sdk-billing-webhook-signature-verifier.service';

describe('SdkBillingWebhookSignatureVerifierService', () => {
  it('delegates to hmac verifier for mock provider', async () => {
    const hmacVerifier = {
      verify: jest.fn().mockResolvedValue({ isValid: true, signature: 'sig-mock' }),
    };
    const service = new SdkBillingWebhookSignatureVerifierService(hmacVerifier);

    const result = await service.verify({
      provider: 'mock',
      rawBody: '{"ok":true}',
      headers: {
        'x-billing-webhook-signature': 'sig-mock',
      },
    });

    expect(result).toEqual({ isValid: true, signature: 'sig-mock' });
    expect(hmacVerifier.verify).toHaveBeenCalled();
  });

  it('rejects invalid stripe signatures (sdk or fallback path)', async () => {
    const hmacVerifier = {
      verify: jest.fn().mockResolvedValue({ isValid: false, signature: null, reason: 'fallback' }),
    };
    const service = new SdkBillingWebhookSignatureVerifierService(hmacVerifier);

    const result = await service.verify({
      provider: 'stripe',
      rawBody: '{"ok":true}',
      headers: {
        'stripe-signature': 't=1700000000,v1=abc',
      },
    });

    expect(result.isValid).toBe(false);
    expect(typeof result.reason).toBe('string');
  });
});
