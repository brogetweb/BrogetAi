import { randomBytes } from 'crypto';
import { BadGatewayException, HttpException, HttpStatus, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Agent, AgentDocument } from '../agents/schemas/agent.schema';
import { CreatePayoutDto, CreateTopupDto, PayinWebhookDto, PayoutWebhookDto } from './dto/wallet.dto';
import { HouseWallet, HouseWalletDocument } from './schemas/house-wallet.schema';
import { WalletEntry, WalletEntryDocument } from './schemas/wallet-entry.schema';
import { API_CHARGE_PAISE, API_FEE_PAISE, API_GST_PAISE, TEST_CREDIT_PAISE, paiseToRupees, rupeesToPaise } from './wallet.money';

@Injectable()
export class WalletService {
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

  async chargeApiHit(agent: AgentDocument) {
    const updated = await this.agents.findOneAndUpdate(
      { _id: agent._id, $expr: { $gte: [{ $ifNull: ['$walletBalancePaise', 0] }, API_CHARGE_PAISE] } },
      { $inc: { walletBalancePaise: -API_CHARGE_PAISE } },
      { new: true },
    );
    if (!updated) {
      throw new HttpException(
        {
          message: 'Low balance',
          code: 'LOW_BALANCE',
          balance: paiseToRupees(agent.walletBalancePaise ?? 0),
          required: paiseToRupees(API_CHARGE_PAISE),
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
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
    return updated.walletBalancePaise ?? 0;
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
    return { requestId, paymentUrl, status: 'pending' };
  }

  async payinWebhook(input: PayinWebhookDto) {
    const entry = await this.entries.findOne({ requestId: input.order_id, kind: 'topup' });
    if (!entry || entry.status === 'success') return { received: true };
    const success = input.status === true && (input.status_text ?? '').toUpperCase() === 'SUCCESS';
    const paid = rupeesToPaise(Number(input.amount ?? 0));
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
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = {};
    }
    const record = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
    const ok = response.ok && record.status !== false && record.success !== false;
    if (!ok) {
      const errors = record.errors && typeof record.errors === 'object' ? Object.values(record.errors as Record<string, unknown>).flat() : [];
      const detail = errors.filter((item): item is string => typeof item === 'string').join(' ');
      const message = typeof record.message === 'string' ? record.message : detail || 'Broget Pay refused the request.';
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

function readPaymentUrl(payload: Record<string, unknown>) {
  const result = payload.result;
  if (!result || typeof result !== 'object') return '';
  const url = (result as Record<string, unknown>).payment_url;
  return typeof url === 'string' ? url : '';
}
