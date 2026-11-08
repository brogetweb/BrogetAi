import { randomBytes } from 'crypto';
import { BadGatewayException, ConflictException, HttpException, HttpStatus, Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Agent, AgentDocument } from '../agents/schemas/agent.schema';
import { CreatePayoutDto, CreateTopupDto, PayinWebhookDto, PayoutWebhookDto } from './dto/wallet.dto';
import { HouseWallet, HouseWalletDocument } from './schemas/house-wallet.schema';
import { WalletEntry, WalletEntryDocument } from './schemas/wallet-entry.schema';
import { API_CHARGE_PAISE, API_FEE_PAISE, API_GST_PAISE, TEST_CREDIT_PAISE, paiseToRupees, rupeesToPaise } from './wallet.money';

/** Longer than the 30s provider timeout. */
const CHECK_LOCK_MS = 60_000;

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @InjectModel(WalletEntry.name) private readonly entries: Model<WalletEntryDocument>,
    @InjectModel(HouseWallet.name) private readonly house: Model<HouseWalletDocument>,
    @InjectModel(Agent.name) private readonly agents: Model<AgentDocument>,
    private readonly config: ConfigService,
  ) {}

  async snapshot(agentId: string) {
    await this.ensureTestCredit(agentId);
    const agent = await this.agents.findById(agentId);
    const balancePaise = agent?.walletBalancePaise ?? 0;
    const rows = await this.entries.find({ agentId }).sort({ createdAt: -1 }).limit(100);
    const added = rows.filter((row) => row.kind === 'topup' && row.status === 'success').reduce((sum, row) => sum + row.amountPaise, 0);
    const spent = rows.filter((row) => row.kind !== 'topup' && row.status === 'success').reduce((sum, row) => sum + row.amountPaise, 0);
    return {
      balance: paiseToRupees(balancePaise),
      added: paiseToRupees(added),
      spent: paiseToRupees(spent),
      fee: paiseToRupees(API_FEE_PAISE),
      gst: paiseToRupees(API_GST_PAISE),
      charge: paiseToRupees(API_CHARGE_PAISE),
      lowBalance: balancePaise < API_CHARGE_PAISE,
      entries: rows.map((row) => this.present(row)),
    };
  }

  private async ensureTestCredit(agentId: string) {
    const enabled = (this.config.get<string>('WALLET_TEST_CREDIT') ?? 'true').trim().toLowerCase() !== 'false';
    if (!enabled) return;
    const updated = await this.agents.findOneAndUpdate(
      { _id: agentId, testCreditApplied: { $ne: true } },
      { $inc: { walletBalancePaise: TEST_CREDIT_PAISE }, $set: { testCreditApplied: true } },
      { new: true },
    );
    if (!updated) return;
    await this.entries.create({
      agentId,
      kind: 'topup',
      amountPaise: TEST_CREDIT_PAISE,
      status: 'success',
      requestId: `TEST${agentId}`,
      note: 'Test balance',
    });
  }

  /**
   * Run before calling the provider. Moves no money: it confirms the wallet can pay and allows
   * one check per agent at a time, so parallel checks cannot both pass on a balance that covers one.
   * The lock expires by itself if the process dies mid-check.
   */
  async beginApiHit(agent: AgentDocument) {
    const now = new Date();
    const held = await this.agents.findOneAndUpdate(
      {
        _id: agent._id,
        $expr: { $gte: [{ $ifNull: ['$walletBalancePaise', 0] }, API_CHARGE_PAISE] },
        $or: [{ creditCheckLockedUntil: { $exists: false } }, { creditCheckLockedUntil: { $lte: now } }],
      },
      { $set: { creditCheckLockedUntil: new Date(now.getTime() + CHECK_LOCK_MS) } },
    );
    if (held) return;
    const current = await this.agents.findById(agent._id);
    const balancePaise = current?.walletBalancePaise ?? 0;
    if (balancePaise < API_CHARGE_PAISE) {
      throw new HttpException(
        { message: 'Low balance', code: 'LOW_BALANCE', balance: paiseToRupees(balancePaise), required: paiseToRupees(API_CHARGE_PAISE) },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
    throw new ConflictException('A credit check is already running. Please wait for it to finish.');
  }

  async endApiHit(agent: AgentDocument) {
    await this.agents.updateOne({ _id: agent._id }, { $unset: { creditCheckLockedUntil: 1 } });
  }

  /** Run only after a report has arrived. The report is already paid for, so this always deducts. */
  async chargeApiHit(agent: AgentDocument) {
    await this.agents.updateOne({ _id: agent._id }, { $inc: { walletBalancePaise: -API_CHARGE_PAISE } });
    const requestId = `USE${randomBytes(8).toString('hex')}`;
    await this.entries.create({
      agentId: String(agent._id),
      kind: 'usage',
      amountPaise: API_CHARGE_PAISE,
      feePaise: API_FEE_PAISE,
      gstPaise: API_GST_PAISE,
      status: 'success',
      requestId,
      note: 'Credit check',
    });
    await this.house.updateOne({ key: 'broget' }, { $inc: { balancePaise: API_CHARGE_PAISE }, $setOnInsert: { key: 'broget' } }, { upsert: true });
    await this.entries.create({
      agentId: 'broget',
      kind: 'topup',
      amountPaise: API_CHARGE_PAISE,
      feePaise: API_FEE_PAISE,
      gstPaise: API_GST_PAISE,
      status: 'success',
      requestId: `FEE${requestId}`,
      note: `Credit check · ${agent.name}`,
    });
  }

  async houseSnapshot() {
    const row = await this.house.findOne({ key: 'broget' });
    const rows = await this.entries.find({ agentId: 'broget' }).sort({ createdAt: -1 }).limit(50);
    return {
      balance: paiseToRupees(row?.balancePaise ?? 0),
      charge: paiseToRupees(API_CHARGE_PAISE),
      entries: rows.map((entry) => this.present(entry)),
    };
  }

  /** Super-admin: CIBIL money collected per agent from wallet usage hits. */
  async cibilRevenueByAgent() {
    const agents = await this.agents.find().sort({ name: 1 });
    const usages = await this.entries
      .find({ kind: 'usage', status: 'success', agentId: { $ne: 'broget' } })
      .sort({ createdAt: -1 });
    const byAgent = new Map<
      string,
      { checks: number; amountPaise: number; feePaise: number; gstPaise: number; lastAt?: Date }
    >();

    for (const entry of usages) {
      const key = String(entry.agentId);
      const current = byAgent.get(key) ?? { checks: 0, amountPaise: 0, feePaise: 0, gstPaise: 0 };
      current.checks += 1;
      current.amountPaise += entry.amountPaise;
      current.feePaise += entry.feePaise ?? 0;
      current.gstPaise += entry.gstPaise ?? 0;
      const created = (entry as WalletEntryDocument & { createdAt?: Date }).createdAt;
      if (created && (!current.lastAt || created > current.lastAt)) current.lastAt = created;
      byAgent.set(key, current);
    }

    const rows = agents.map((agent) => {
      const id = String(agent._id);
      const code = agent.code || id;
      const stats = byAgent.get(id) ?? byAgent.get(code) ?? { checks: 0, amountPaise: 0, feePaise: 0, gstPaise: 0 };
      return {
        agentId: agent.code || id,
        agentMongoId: id,
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        city: agent.city || '',
        status: agent.status,
        walletBalance: paiseToRupees(agent.walletBalancePaise ?? 0),
        checks: stats.checks,
        amount: paiseToRupees(stats.amountPaise),
        fee: paiseToRupees(stats.feePaise),
        gst: paiseToRupees(stats.gstPaise),
        lastCheckAt: stats.lastAt ? stats.lastAt.toISOString() : null,
        hasActivity: stats.checks > 0,
      };
    });

    rows.sort((a, b) => b.amount - a.amount || a.name.localeCompare(b.name));

    const totalChecks = rows.reduce((sum, row) => sum + row.checks, 0);
    const totalAmount = rows.reduce((sum, row) => sum + row.amount, 0);
    const activeAgents = rows.filter((row) => row.hasActivity).length;
    const silentAgents = rows.filter((row) => !row.hasActivity).length;

    return {
      chargePerCheck: paiseToRupees(API_CHARGE_PAISE),
      feePerCheck: paiseToRupees(API_FEE_PAISE),
      gstPerCheck: paiseToRupees(API_GST_PAISE),
      totalChecks,
      totalAmount,
      activeAgents,
      silentAgents,
      agents: rows,
    };
  }

  async createTopup(agentId: string, input: CreateTopupDto) {
    const amountPaise = rupeesToPaise(input.amount);
    const requestId = `ORD${randomBytes(6).toString('hex')}`;
    await this.entries.create({
      agentId,
      kind: 'topup',
      amountPaise,
      status: 'pending',
      requestId,
      note: 'Broget Pay',
    });
    let result: Record<string, unknown>;
    try {
      result = await this.gateway('/pg/create-request', {
        apikey: this.apiKey(),
        mobile: input.mobile,
        mobilenumber: input.mobile,
        amount: input.amount.toFixed(2),
        request_id: requestId,
        order_id: requestId,
        redirect_url: `${this.publicUrl()}/api/v1/wallet/payin/return`,
        remark1: 'Wallet top up',
        remark2: agentId,
      });
    } catch (error) {
      await this.entries.updateOne({ requestId, status: 'pending' }, { status: 'failed' });
      throw error;
    }
    const paymentUrl = readPaymentUrl(result);
    if (!paymentUrl) {
      await this.entries.updateOne({ requestId }, { status: 'failed', note: 'Broget Pay did not return a payment link.' });
      throw new BadGatewayException('Broget Pay did not return a payment link.');
    }
    const upiUrl = await this.readUpiLink(paymentUrl);
    return {
      requestId,
      paymentUrl: `${this.publicUrl()}/api/v1/wallet/payin/open/${requestId}`,
      checkoutUrl: paymentUrl,
      upiUrl,
      status: 'pending',
    };
  }

  async payinOpenPage(requestId: string) {
    if (!/^ORD[A-Za-z0-9]+$/.test(requestId)) throw new NotFoundException();
    const entry = await this.entries.findOne({ requestId, kind: 'topup' });
    if (!entry) throw new NotFoundException();
    const checkout = `${this.gatewayOrigin()}/payment/${requestId}`;
    const upiUrl = await this.readUpiLink(checkout);
    const amount = paiseToRupees(entry.amountPaise).toFixed(2);
    const pay = upiUrl
      ? `<a class="pay" href="${escapeAttr(androidUpiIntent(upiUrl))}">Pay ₹${amount} with UPI</a><p class="hint">PhonePe, GPay, or Paytm should open. If they do not, <a href="${escapeAttr(upiUrl)}">tap here</a>. Finish the payment within 5 minutes.</p>`
      : '<p class="hint">The UPI app link is not ready. Use the QR page instead.</p>';
    return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pay with UPI</title><style>body{font-family:sans-serif;margin:0;background:#f6f8fb;color:#172033}main{max-width:420px;margin:0 auto;padding:28px 20px}h1{font-size:22px;margin:0 0 8px}.pay{display:block;text-align:center;background:#0356e8;color:#fff;text-decoration:none;font-weight:800;border-radius:14px;padding:16px;margin:18px 0}.qr{color:#0356e8;font-weight:700}.hint{color:#64748b;line-height:1.45;font-size:14px}</style></head><body><main><h1>Pay ₹${amount}</h1><p class="hint">Broget Pay only records the payment after the UPI app confirms it. Until then the order stays pending and this wallet does not increase.</p>${pay}<p><a class="qr" href="${escapeAttr(checkout)}">Show QR instead</a></p></main></body></html>`;
  }

  async payinWebhook(input: PayinWebhookDto) {
    const orderId = String(input?.order_id || '');
    if (!orderId) return { received: true };
    const entry = await this.entries.findOne({ requestId: orderId, kind: 'topup' });
    if (!entry || entry.status === 'success') return { received: true };
    const text = String(input.status_text ?? '').toUpperCase();
    const rawStatus = input.status as unknown;
    const failed = rawStatus === false || rawStatus === 0 || rawStatus === '0' || rawStatus === 'false' || text === 'FAILED';
    const success = !failed && (rawStatus === true || rawStatus === 1 || rawStatus === '1' || rawStatus === 'true' || text === 'SUCCESS');
    const paid = input.amount == null || input.amount === '' ? entry.amountPaise : rupeesToPaise(Number(input.amount));
    if (!success || paid !== entry.amountPaise) {
      await this.entries.updateOne({ _id: entry._id, status: 'pending' }, { status: 'failed', note: success ? 'Amount did not match the wallet request.' : 'Broget Pay marked the payment failed.' });
      return { received: true };
    }
    const claimed = await this.entries.findOneAndUpdate({ _id: entry._id, status: 'pending' }, { status: 'success', utr: input.utr || undefined }, { new: true });
    if (!claimed) return { received: true };
    await this.agents.updateOne({ _id: claimed.agentId }, { $inc: { walletBalancePaise: claimed.amountPaise } });
    return { received: true };
  }

  async createPayout(agentId: string, input: CreatePayoutDto) {
    const amountPaise = rupeesToPaise(input.amount);
    const updated = await this.agents.findOneAndUpdate(
      { _id: agentId, $expr: { $gte: [{ $ifNull: ['$walletBalancePaise', 0] }, amountPaise] } },
      { $inc: { walletBalancePaise: -amountPaise } },
      { new: true },
    );
    if (!updated) throw new HttpException({ message: 'Low balance', code: 'LOW_BALANCE' }, HttpStatus.PAYMENT_REQUIRED);
    const requestId = `PAYOUT${randomBytes(6).toString('hex')}`;
    await this.entries.create({
      agentId,
      kind: 'withdraw',
      amountPaise,
      status: 'pending',
      requestId,
      note: input.bankName,
    });
    try {
      await this.gateway('/pg/payout/create-request', {
        apikey: this.apiKey(),
        request_id: requestId,
        mobile: input.mobile,
        amount: input.amount.toFixed(2),
        holder_name: input.holderName,
        bank_name: input.bankName,
        account_number: input.accountNumber,
        ifsc: input.ifsc,
      });
    } catch (error) {
      await this.entries.updateOne({ requestId }, { status: 'failed' });
      await this.agents.updateOne({ _id: agentId }, { $inc: { walletBalancePaise: amountPaise } });
      throw error;
    }
    return { requestId, status: 'pending', balance: paiseToRupees(updated.walletBalancePaise ?? 0) };
  }

  async payoutWebhook(input: PayoutWebhookDto) {
    const requestId = input.data?.request_id;
    if (!requestId) return { received: true };
    const entry = await this.entries.findOne({ requestId, kind: 'withdraw', status: 'pending' });
    if (!entry) return { received: true };
    const success = input.status === true && (input.data.status ?? '').toLowerCase() === 'success';
    const claimed = await this.entries.findOneAndUpdate(
      { _id: entry._id, status: 'pending' },
      { status: success ? 'success' : 'failed', utr: input.data.utr || undefined },
      { new: true },
    );
    if (!claimed) return { received: true };
    if (!success) await this.agents.updateOne({ _id: claimed.agentId }, { $inc: { walletBalancePaise: claimed.amountPaise } });
    return { received: true };
  }

  private gatewayOrigin() {
    const base = this.config.get<string>('BROGETPAY_BASE_URL') || 'https://gateway.brogetpay.com/api';
    return new URL(base).origin;
  }

  private async readUpiLink(paymentUrl: string) {
    try {
      const response = await fetch(paymentUrl, {
        headers: { Accept: 'text/html', 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(8000),
      });
      const html = await response.text();
      const match = html.match(/const upiUrl = "([^"]+)"/);
      if (!match) return '';
      const link = decodeJsString(match[1]);
      return link.startsWith('upi://pay?') ? encodeUpiLink(link) : '';
    } catch {
      return '';
    }
  }

  private apiKey() {
    const key = this.config.get<string>('BROGETPAY_API_KEY')?.trim();
    if (!key) throw new ServiceUnavailableException('Broget Pay is not configured.');
    return key;
  }

  private publicUrl() {
    const url = this.config.get<string>('PUBLIC_API_URL')?.trim().replace(/\/$/, '');
    if (!url) throw new ServiceUnavailableException('PUBLIC_API_URL is not configured.');
    return url;
  }

  private async gateway(path: string, body: Record<string, string>) {
    const base = (this.config.get<string>('BROGETPAY_BASE_URL')?.trim() || 'https://gateway.brogetpay.com/api').replace(/\/$/, '');
    let response: Response;
    try {
      response = await fetch(`${base}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': 'BrogetAI-Wallet/1.0' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000),
      });
    } catch {
      throw new BadGatewayException('Broget Pay could not be reached.');
    }
    const text = await response.text();
    let payload: unknown = {};
    let parsed = true;
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      parsed = false;
      payload = {};
    }
    const record = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
    const ok = response.ok && record.status !== false && record.success !== false;
    if (!ok) {
      // Log what the gateway actually sent (response only - never the request body, which holds the apikey).
      const snippet = text.replace(/\s+/g, ' ').slice(0, 600);
      this.logger.warn(
        `Broget Pay ${path} failed: HTTP ${response.status} ${response.headers.get('content-type') ?? ''} ${parsed ? 'json' : 'non-json'} body=${snippet || '(empty)'}`,
      );
      const errors = record.errors && typeof record.errors === 'object' ? Object.values(record.errors as Record<string, unknown>).flat() : [];
      const detail = errors.filter((item): item is string => typeof item === 'string').join(' ');
      const nested = record.data && typeof record.data === 'object' ? (record.data as Record<string, unknown>).message : undefined;
      const text2 = [record.message, record.msg, record.error, record.status_text, nested].find((v): v is string => typeof v === 'string' && v.trim() !== '');
      const message =
        text2 ||
        detail ||
        (parsed
          ? `Broget Pay refused the request (HTTP ${response.status}).`
          : `Broget Pay returned an unexpected response (HTTP ${response.status}). Check the server logs.`);
      throw new BadGatewayException(message);
    }
    return record;
  }

  private present(row: WalletEntryDocument) {
    return {
      id: row.requestId,
      kind: row.kind,
      amount: paiseToRupees(row.amountPaise),
      fee: row.feePaise == null ? undefined : paiseToRupees(row.feePaise),
      gst: row.gstPaise == null ? undefined : paiseToRupees(row.gstPaise),
      status: row.status,
      note: row.note ?? '',
      utr: row.utr ?? '',
      createdAt: (row as WalletEntryDocument & { createdAt?: Date }).createdAt ?? new Date(),
    };
  }
}

function decodeJsString(value: string) {
  return value.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) => String.fromCharCode(Number.parseInt(hex, 16))).replace(/\\\//g, '/');
}

function encodeUpiLink(upiUrl: string) {
  const mark = upiUrl.indexOf('?');
  if (mark < 0) return upiUrl;
  const query = upiUrl
    .slice(mark + 1)
    .split('&')
    .filter(Boolean)
    .map((part) => {
      const eq = part.indexOf('=');
      const key = eq >= 0 ? part.slice(0, eq) : part;
      const value = eq >= 0 ? part.slice(eq + 1) : '';
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');
  return `${upiUrl.slice(0, mark)}?${query}`;
}

function androidUpiIntent(upiUrl: string) {
  const query = upiUrl.replace(/^upi:\/\/pay\?/i, '');
  return `intent://pay?${query}#Intent;scheme=upi;end`;
}

function escapeAttr(value: string) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function readPaymentUrl(payload: Record<string, unknown>) {
  const result = payload.result;
  if (!result || typeof result !== 'object') return '';
  const url = (result as Record<string, unknown>).payment_url;
  return typeof url === 'string' ? url : '';
}
