import { createHmac, timingSafeEqual } from 'crypto';
import { BadGatewayException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const API = 'https://api.razorpay.com/v1';

export type RazorpayOrder = { id: string; amount: number; currency: string; status: string };

export type RazorpayPayment = {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  method?: string;
  error_description?: string | null;
  acquirer_data?: { rrn?: string; upi_transaction_id?: string; bank_transaction_id?: string } | null;
};

/**
 * Razorpay Orders + Standard Checkout. Key ID/secret come from the Razorpay dashboard
 * (Account & Settings → API Keys). rzp_test_* keys run in test mode, rzp_live_* in live mode.
 */
@Injectable()
export class RazorpayClient {
  private readonly logger = new Logger(RazorpayClient.name);

  constructor(private readonly config: ConfigService) {}

  /** Public key - safe to send to the browser / app checkout. */
  keyId() {
    return this.creds().keyId;
  }

  createOrder(input: { amountPaise: number; receipt: string; notes: Record<string, string> }) {
    return this.call<RazorpayOrder>('POST', '/orders', { amount: input.amountPaise, currency: 'INR', receipt: input.receipt, notes: input.notes });
  }

  async orderPayments(orderId: string) {
    const body = await this.call<{ items?: RazorpayPayment[] }>('GET', `/orders/${encodeURIComponent(orderId)}/payments`);
    return body.items ?? [];
  }

  /** Needed only when the account is set to manual capture; auto-captured payments are already captured. */
  capture(paymentId: string, amountPaise: number) {
    return this.call<RazorpayPayment>('POST', `/payments/${encodeURIComponent(paymentId)}/capture`, { amount: amountPaise, currency: 'INR' });
  }

  /** Checkout success signature: HMAC_SHA256(order_id + "|" + payment_id, key_secret). */
  verifyCheckout(orderId: string, paymentId: string, signature: string) {
    return safeEqual(hmac(`${orderId}|${paymentId}`, this.creds().keySecret), signature);
  }

  /** Webhook signature: HMAC_SHA256(raw body, webhook secret). False when no webhook secret is configured. */
  verifyWebhook(rawBody: Buffer | string, signature: string | undefined) {
    const secret = this.read('RAZORPAY_WEBHOOK_SECRET');
    if (!secret || !signature) return false;
    return safeEqual(hmac(rawBody, secret), signature);
  }

  private async call<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
    const { keyId, keySecret } = this.creds();
    let response: Response;
    try {
      response = await fetch(`${API}${path}`, {
        method,
        headers: {
          Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: body == null ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(30000),
      });
    } catch {
      throw new BadGatewayException('Razorpay could not be reached.');
    }
    const text = await response.text();
    let record: Record<string, unknown> = {};
    try {
      record = text ? (JSON.parse(text) as Record<string, unknown>) : {};
    } catch {
      record = {};
    }
    if (!response.ok) {
      const error = (record.error ?? {}) as { description?: string; code?: string };
      this.logger.warn(`Razorpay ${method} ${path.split('/').slice(0, 2).join('/')} failed: HTTP ${response.status} ${error.code ?? ''} ${error.description ?? text.slice(0, 300)}`);
      throw new BadGatewayException(error.description || `Razorpay refused the request (HTTP ${response.status}).`);
    }
    return record as T;
  }

  private creds() {
    const keyId = this.read('RAZORPAY_KEY_ID');
    const keySecret = this.read('RAZORPAY_KEY_SECRET');
    if (!keyId || !keySecret) throw new ServiceUnavailableException('Razorpay is not configured.');
    return { keyId, keySecret };
  }

  private read(key: string) {
    return this.config.get<string>(key)?.trim() ?? '';
  }
}

function hmac(value: Buffer | string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('hex');
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}
