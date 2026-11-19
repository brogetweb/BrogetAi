import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const DEFAULT_URL = 'https://api.aopay.in/api/AOP/Balance';

export type AopayBalance = {
  configured: boolean;
  ok: boolean;
  /** Rupees, when AO Pay returned a number. */
  balance: number | null;
  message: string;
  checkedAt: string;
};

/**
 * Our own prepaid balance at AO Pay (every CIBIL hit is deducted from it).
 * POST https://api.aopay.in/api/AOP/Balance with nep_key, domain, partnerId, RegistrationID
 * (docs: https://readapi.aopay.co.in/panBalance.aspx). nep_key / domain / partnerId come from AO Pay.
 */
@Injectable()
export class AopayBalanceClient {
  private readonly logger = new Logger(AopayBalanceClient.name);

  constructor(private readonly config: ConfigService) {}

  async fetch(): Promise<AopayBalance> {
    const checkedAt = new Date().toISOString();
    const nepKey = this.read('AOPAY_NEP_KEY');
    const registrationId = this.read('AOPAY_REGISTRATION_ID');
    if (!nepKey || !registrationId) {
      return { configured: false, ok: false, balance: null, message: 'Add AOPAY_NEP_KEY, AOPAY_PARTNER_ID and AOPAY_DOMAIN (from AO Pay) to show the live balance.', checkedAt };
    }
    try {
      const response = await fetch(this.read('AOPAY_BALANCE_URL') || DEFAULT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ nep_key: nepKey, domain: this.read('AOPAY_DOMAIN'), partnerId: this.read('AOPAY_PARTNER_ID'), RegistrationID: registrationId }),
        signal: AbortSignal.timeout(20000),
      });
      const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
      const balance = readNumber(body.wallet ?? body.balance ?? body.Balance ?? (body.data as Record<string, unknown> | undefined)?.balance);
      const message = typeof body.message === 'string' ? body.message : '';
      if (balance === null) {
        this.logger.warn(`AO Pay balance: no amount returned (HTTP ${response.status}) ${message}`);
        return { configured: true, ok: false, balance: null, message: message || 'AO Pay did not return a balance.', checkedAt };
      }
      return { configured: true, ok: true, balance, message, checkedAt };
    } catch (error) {
      return { configured: true, ok: false, balance: null, message: `AO Pay could not be reached: ${error instanceof Error ? error.message : 'error'}`, checkedAt };
    }
  }

  private read(key: string) {
    return this.config.get<string>(key)?.trim() ?? '';
  }
}

function readNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) return Number(value);
  if (value && typeof value === 'object') {
    for (const key of ['balance', 'Balance', 'amount', 'walletBalance', 'main_balance']) {
      const found = readNumber((value as Record<string, unknown>)[key]);
      if (found !== null) return found;
    }
  }
  return null;
}
