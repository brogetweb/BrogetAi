import { appendFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { BadGatewayException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { generateBosClientSecret } from '../flights/bos-client-secret';

const DEFAULT_URL = 'https://api.aopay.co.in/api/AOP/V2/Transunion/Score/Hybrid';

export type CibilGender = 'Male' | 'Female';

export type CibilRequest = {
  firstName: string;
  lastName: string;
  phone: string;
  gender: CibilGender;
  pan: string;
};

export type CibilResult = {
  ok: boolean;
  message: string;
  /** TransUnion product web token URL - opens the customer's full report. */
  reportUrl: string;
  body: unknown;
  httpStatus: number;
};

/**
 * AO Pay (BOS Center) TransUnion CIBIL Report - V2 Hybrid.
 * Docs: https://readapi.aopay.co.in/TransunionCibilReport and /Authorization.aspx.
 * Every call is written to logs/aopay-cibil-YYYY-MM-DD.log (PAN/phone masked) - AO Pay asks for this
 * "API Log File" before enabling production.
 */
@Injectable()
export class AopayCibilClient {
  private readonly logger = new Logger(AopayCibilClient.name);

  constructor(private readonly config: ConfigService) {}

  registrationId() {
    const id = this.read('AOPAY_REGISTRATION_ID');
    if (!id) throw new ServiceUnavailableException('CIBIL is not configured (AOPAY_REGISTRATION_ID).');
    return id;
  }

  /** Client Secret per AO Pay docs: HMAC-SHA256(key = Base64(SHA256(RegID)), msg = RegID), Base64. */
  clientSecret() {
    return this.read('AOPAY_CLIENT_SECRET') || generateBosClientSecret(this.registrationId());
  }

  async fetchReport(input: CibilRequest): Promise<CibilResult> {
    const url = this.read('AOPAY_CIBIL_URL') || DEFAULT_URL;
    const body = {
      FirstName: input.firstName,
      LastName: input.lastName,
      PhoneNumber: input.phone,
      Gender: input.gender,
      PanNumber: input.pan,
      RegistrationID: this.registrationId(),
    };
    const started = Date.now();
    let httpStatus = 0;
    let text = '';
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(90000),
      });
      httpStatus = response.status;
      text = await response.text();
    } catch (error) {
      await this.log({ url, request: body, httpStatus: 0, error: error instanceof Error ? error.message : String(error), ms: Date.now() - started });
      throw new BadGatewayException('The CIBIL service could not be reached. No fee was charged.');
    }
    let parsed: unknown;
    try {
      parsed = text ? JSON.parse(text) : {};
    } catch {
      parsed = { message: text.slice(0, 300) };
    }
    await this.log({ url, request: body, httpStatus, response: parsed, ms: Date.now() - started });
    const ok = httpStatus >= 200 && httpStatus < 300 && isHybridSuccess(parsed);
    return { ok, message: readMessage(parsed) || (ok ? 'CIBIL report ready.' : 'The CIBIL report could not be prepared.'), reportUrl: ok ? readReportUrl(parsed) : '', body: parsed, httpStatus };
  }

  private async log(entry: { url: string; request: Record<string, string>; httpStatus: number; response?: unknown; error?: string; ms: number }) {
    try {
      const dir = this.read('AOPAY_LOG_DIR') || join(process.cwd(), 'logs');
      await mkdir(dir, { recursive: true });
      const line = JSON.stringify({
        at: new Date().toISOString(),
        url: entry.url,
        ms: entry.ms,
        request: { ...entry.request, PanNumber: maskPan(entry.request.PanNumber), PhoneNumber: maskPhone(entry.request.PhoneNumber) },
        httpStatus: entry.httpStatus,
        response: entry.response,
        error: entry.error,
      });
      await appendFile(join(dir, `aopay-cibil-${new Date().toISOString().slice(0, 10)}.log`), `${line}\n`, 'utf8');
    } catch (error) {
      this.logger.warn(`Could not write CIBIL API log: ${String(error)}`);
    }
  }

  private read(key: string) {
    return this.config.get<string>(key)?.trim() ?? '';
  }
}

/**
 * Success = {"status":{"type":"success"}} or {"data":{"status":"success"}}.
 * Refusals come back as HTTP 200 too, e.g. {"status":null,"message":"cibil Api is Deactivated ...","data":null,"Status":"False"}.
 */
export function isHybridSuccess(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  const upper = record.Status;
  if (upper != null && /^(false|0|204|4\d\d|5\d\d)$/i.test(String(upper).trim())) return false;
  const status = record.status as Record<string, unknown> | null | undefined;
  const data = record.data as Record<string, unknown> | null | undefined;
  const typeOk = !!status && typeof status === 'object' && String(status.type ?? '').toLowerCase() === 'success';
  const dataOk = !!data && typeof data === 'object' && String(data.status ?? '').toLowerCase() === 'success';
  return typeOk || dataOk;
}

function readReportUrl(value: unknown) {
  const data = (value as { data?: { web_token_url?: unknown } } | null)?.data;
  const url = typeof data?.web_token_url === 'string' ? data.web_token_url.trim() : '';
  return /^https?:\/\//i.test(url) ? url : '';
}

function readMessage(value: unknown) {
  if (!value || typeof value !== 'object') return '';
  const record = value as Record<string, unknown>;
  for (const candidate of [record.message, record.returnMessage, (record.status as { message?: unknown } | null)?.message]) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }
  return '';
}

function maskPan(pan: string) {
  return pan && pan.length === 10 ? `${pan.slice(0, 3)}XXXX${pan.slice(7)}` : pan;
}

function maskPhone(phone: string) {
  return phone && phone.length >= 10 ? `${phone.slice(0, 2)}XXXXXX${phone.slice(-2)}` : phone;
}
