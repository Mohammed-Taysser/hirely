import CONFIG from '@/apps/config';
import {
  BillingWebhookSignatureVerifyInput,
  BillingWebhookSignatureVerifyResult,
  IBillingWebhookSignatureVerifierService,
} from '@/modules/billing/application/services/billing-webhook-signature-verifier.service.interface';
import { HmacBillingWebhookSignatureVerifierService } from '@/modules/billing/infrastructure/services/hmac-billing-webhook-signature-verifier.service';

type StripeWebhooksApi = {
  constructEvent: (rawBody: string, signature: string, secret: string) => unknown;
};

type StripeStaticApi = {
  webhooks?: StripeWebhooksApi;
};

type StripeModule = {
  default?: StripeStaticApi;
};

type PaddleWebhookVerifier = {
  verify: (rawBody: string, signature: string, secret: string) => boolean;
};

type PaddleWebhookVerifierCtor = new () => PaddleWebhookVerifier;

type PaddleModule = {
  WebhookVerifier?: PaddleWebhookVerifierCtor;
  default?: {
    WebhookVerifier?: PaddleWebhookVerifierCtor;
  };
};

const isModuleUnavailableError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes('Cannot find module') ||
    error.message.includes('ERR_MODULE_NOT_FOUND') ||
    error.message.includes("Cannot find package '@paddle/paddle-node-sdk'") ||
    error.message.includes("Cannot find package 'stripe'")
  );
};

const getHeaderValue = (
  headers: Record<string, string | undefined>,
  headerName: string
): string | undefined => headers[headerName.toLowerCase()] ?? headers[headerName];

export class SdkBillingWebhookSignatureVerifierService implements IBillingWebhookSignatureVerifierService {
  private readonly hmacVerifier: IBillingWebhookSignatureVerifierService;
  private readonly stripeSecret: string;
  private readonly paddleSecret: string;

  constructor(hmacVerifier?: IBillingWebhookSignatureVerifierService) {
    this.hmacVerifier = hmacVerifier ?? new HmacBillingWebhookSignatureVerifierService();
    this.stripeSecret = CONFIG.BILLING_STRIPE_WEBHOOK_SECRET.trim();
    this.paddleSecret = CONFIG.BILLING_PADDLE_WEBHOOK_SECRET.trim();
  }

  private async verifyStripe(
    input: BillingWebhookSignatureVerifyInput
  ): Promise<BillingWebhookSignatureVerifyResult> {
    const signature = getHeaderValue(input.headers, 'stripe-signature');
    if (!signature) {
      return { isValid: false, signature: null, reason: 'Missing stripe-signature header' };
    }

    try {
      const stripeModuleName = 'stripe';
      const stripeModule = (await import(stripeModuleName)) as StripeModule;
      const webhooksApi = stripeModule.default?.webhooks;
      if (!webhooksApi) {
        return this.hmacVerifier.verify(input);
      }

      if (!this.stripeSecret) {
        return this.hmacVerifier.verify(input);
      }

      webhooksApi.constructEvent(input.rawBody, signature, this.stripeSecret);
      return { isValid: true, signature };
    } catch (error) {
      if (isModuleUnavailableError(error)) {
        return this.hmacVerifier.verify(input);
      }

      return {
        isValid: false,
        signature,
        reason: error instanceof Error ? error.message : 'Invalid Stripe signature',
      };
    }
  }

  private async verifyPaddle(
    input: BillingWebhookSignatureVerifyInput
  ): Promise<BillingWebhookSignatureVerifyResult> {
    const signature = getHeaderValue(input.headers, 'paddle-signature');
    if (!signature) {
      return { isValid: false, signature: null, reason: 'Missing paddle-signature header' };
    }

    try {
      const paddleModuleName = '@paddle/paddle-node-sdk';
      const paddleModule = (await import(paddleModuleName)) as PaddleModule;
      const verifierCtor = paddleModule.WebhookVerifier ?? paddleModule.default?.WebhookVerifier;

      if (!verifierCtor) {
        return this.hmacVerifier.verify(input);
      }

      if (!this.paddleSecret) {
        return this.hmacVerifier.verify(input);
      }

      const verifier = new verifierCtor();
      const isValid = Boolean(verifier.verify(input.rawBody, signature, this.paddleSecret));
      return {
        isValid,
        signature,
        reason: isValid ? undefined : 'Invalid Paddle signature',
      };
    } catch (error) {
      if (isModuleUnavailableError(error)) {
        return this.hmacVerifier.verify(input);
      }

      return {
        isValid: false,
        signature,
        reason: error instanceof Error ? error.message : 'Invalid Paddle signature',
      };
    }
  }

  async verify(
    input: BillingWebhookSignatureVerifyInput
  ): Promise<BillingWebhookSignatureVerifyResult> {
    if (input.provider === 'stripe') {
      return this.verifyStripe(input);
    }

    if (input.provider === 'paddle') {
      return this.verifyPaddle(input);
    }

    return this.hmacVerifier.verify(input);
  }
}
