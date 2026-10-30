import { BadGatewayException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { generateBosClientSecret } from './bos-client-secret';

@Injectable()
export class BosFlightClient {
  private readonly logger = new Logger(BosFlightClient.name);

  constructor(private readonly config: ConfigService) {}

  /** Local mode: skip live BOS / IP whitelist. Flip false later for real UAT. */
  mockEnabled() {
    const raw = (this.config.get<string>('BOS_FLIGHT_MOCK') ?? 'true').trim().toLowerCase();
    return raw === 'true' || raw === '1' || raw === 'yes';
  }

  /** Flight UAT only — do not fall back to credit AOPAY_REGISTRATION_ID (AOP-5065). */
  registrationId() {
    return this.config.get<string>('BOS_FLIGHT_REGISTRATION_ID')?.trim() || 'AOP-1006';
  }

  clientSecret() {
    const configured = this.config.get<string>('BOS_FLIGHT_CLIENT_SECRET')?.trim();
    if (configured) return configured;
    const id = this.registrationId();
    if (!id) return '';
    return generateBosClientSecret(id);
  }

  publicKey() {
    const raw = this.config.get<string>('BOS_FLIGHT_PUBLIC_KEY')?.trim() || '';
    return raw.replace(/\\n/g, '\n').trim();
  }

  ipAddress() {
    if (this.mockEnabled()) return this.config.get<string>('BOS_FLIGHT_IP_ADDRESS')?.trim() || '127.0.0.1';
    return this.config.get<string>('BOS_FLIGHT_IP_ADDRESS')?.trim() || '';
  }

  baseUrl() {
    return (this.config.get<string>('BOS_FLIGHT_BASE_URL')?.trim() || 'https://travel.bospay.co.in/api/V1/Air/Travel').replace(/\/$/, '');
  }

  assertLiveConfigured() {
    if (!this.registrationId()) throw new ServiceUnavailableException('BOS_FLIGHT_REGISTRATION_ID is not configured.');
    if (!this.ipAddress() || this.ipAddress() === '127.0.0.1') {
      throw new ServiceUnavailableException('BOS_FLIGHT_IP_ADDRESS is required when BOS_FLIGHT_MOCK=false.');
    }
  }

  async airSearch(body: Record<string, unknown>) {
    return this.post('AirSearch', body);
  }

  async post(method: string, body: Record<string, unknown>) {
    this.assertLiveConfigured();
    const url = `${this.baseUrl()}/${method}`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const secret = this.clientSecret();
    if (secret) {
      headers.ClientSecret = secret;
      headers['X-CLIENT-SECRET'] = secret;
    }
    headers.RegistrationID = this.registrationId();
    headers['X-REGISTRATION-ID'] = this.registrationId();
    const pub = this.publicKey();
    if (pub) {
      const compact = pub.replace(/\s+/g, '');
      headers.PublicKey = compact;
      headers['X-PUBLIC-KEY'] = compact;
    }

    let response: Response;
    let text: string;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(60000),
      });
      text = await response.text();
    } catch (error) {
      this.logger.warn(`BOS ${method} network error: ${error instanceof Error ? error.message : 'unknown'}`);
      throw new BadGatewayException('Flight provider could not be reached.');
    }

    if (response.status === 204 || !text.trim()) {
      this.logger.warn(`BOS ${method} empty response HTTP ${response.status}`);
      throw new BadGatewayException(
        `Flight provider empty response (${response.status}). Whitelist IP or set BOS_FLIGHT_MOCK=true for local.`,
      );
    }

    let json: unknown = {};
    try {
      json = JSON.parse(text);
    } catch {
      this.logger.warn(`BOS ${method} non-JSON (${response.status}): ${text.slice(0, 180)}`);
      throw new BadGatewayException('Flight provider returned an invalid response.');
    }

    if (!response.ok) {
      this.logger.warn(`BOS ${method} HTTP ${response.status}: ${text.slice(0, 240)}`);
      throw new BadGatewayException(readProviderMessage(json) || `Flight provider error (${response.status}).`);
    }

    return json;
  }

  newRequestId() {
    return `BG${Date.now()}${randomUUID().replace(/-/g, '').slice(0, 8)}`.slice(0, 32);
  }

  imei() {
    return this.config.get<string>('BOS_FLIGHT_IMEI')?.trim() || '353535353535353';
  }
}

function readProviderMessage(value: unknown) {
  if (!value || typeof value !== 'object') return '';
  const row = value as Record<string, unknown>;
  const header = row.response_Header;
  if (header && typeof header === 'object') {
    const h = header as Record<string, unknown>;
    const desc = typeof h.error_Desc === 'string' ? h.error_Desc : '';
    const code = typeof h.error_Code === 'string' ? h.error_Code : '';
    if (code && code !== '0000') return desc || code;
  }
  if (typeof row.message === 'string' && row.message.trim()) return row.message.trim();
  if (typeof row.description === 'string' && row.description.trim()) return row.description.trim();
  return '';
}
