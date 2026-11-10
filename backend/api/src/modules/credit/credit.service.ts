import { BadGatewayException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Agent, AgentDocument } from '../agents/schemas/agent.schema';
import { AccessPayload } from '../auth/auth.types';
import { CustomersService } from '../customers/customers.service';
import { AopayCibilClient } from './aopay-cibil.client';
import { buildCreditReportPdf } from './credit-report.pdf';
import { CreateCreditReportDto } from './dto/create-credit-report.dto';
import { CreditReport, CreditReportDocument } from './schemas/credit-report.schema';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class CreditService {
  private readonly logger = new Logger(CreditService.name);

  constructor(
    @InjectModel(CreditReport.name) private readonly reports: Model<CreditReportDocument>,
    @InjectModel(Agent.name) private readonly agents: Model<AgentDocument>,
    private readonly config: ConfigService,
    private readonly customers: CustomersService,
    private readonly wallet: WalletService,
    private readonly cibil: AopayCibilClient,
  ) {}

  async create(user: AccessPayload, input: CreateCreditReportDto) {
    const agent = await this.agents.findById(user.sub);
    if (!agent || agent.status !== 'active') throw new UnauthorizedException('Sign in again.');
    this.cibil.registrationId(); // fail fast (503) before touching the wallet when CIBIL is not configured
    await this.wallet.beginApiHit(agent);
    try {
      return await this.runCheck(agent, input);
    } finally {
      await this.wallet.endApiHit(agent);
    }
  }

  private async runCheck(agent: AgentDocument, input: CreateCreditReportDto) {
    let result;
    try {
      result = await this.cibil.fetchReport({ firstName: input.firstName, lastName: input.lastName, phone: input.mobile, gender: input.gender, pan: input.pan });
    } catch (error) {
      await this.customers.upsertFromCheck(this.customerFromCheck(agent, input, null, false));
      throw error;
    }
    const { ok, message, reportUrl } = result;
    const score = ok ? findScore(result.body) : null;
    const saved = await this.reports.create({
      agentId: agent.code,
      agentName: agent.name,
      firstName: input.firstName,
      lastName: input.lastName,
      mobile: input.mobile,
      email: input.email,
      panMasked: maskPan(input.pan),
      dateOfBirth: input.dateOfBirth,
      gender: input.gender,
      consentAcceptance: 'Yes',
      status: ok ? 'ready' : 'failed',
      score: score ?? undefined,
      reportUrl: reportUrl || undefined,
      message,
      report: result.body,
    });
    await this.customers.upsertFromCheck(this.customerFromCheck(agent, input, score, ok));
    if (!ok) throw new BadGatewayException(`${message.replace(/\.?\s*$/, '.')} No fee was charged.`);
    // A report was delivered (score and/or full-report link), so the check is paid for.
    if (score === null && !reportUrl) return this.present(saved);
    try {
      await this.wallet.chargeApiHit(agent);
    } catch (error) {
      this.logger.error(`Report ${saved.id} is ready but agent ${agent.code} was not charged: ${String(error)}`);
    }
    return this.present(saved);
  }

  async list() {
    const rows = await this.reports.find().sort({ createdAt: -1 }).limit(200);
    return rows.map((row) => this.present(row));
  }

  async mine(user: AccessPayload) {
    const agent = await this.agents.findById(user.sub);
    if (!agent || agent.status !== 'active') throw new UnauthorizedException('Sign in again.');
    const rows = await this.reports.find({ agentId: agent.code }).sort({ createdAt: -1 }).limit(500);
    return rows.map((row) => this.present(row));
  }

  async remove(id: string) {
    if (!isValidObjectId(id)) throw new NotFoundException('That credit report is not on this desk.');
    const row = await this.reports.findByIdAndDelete(id);
    if (!row) throw new NotFoundException('That credit report is not on this desk.');
    const customer = await this.customers.refreshAfterReportRemoved(row.agentId, row.mobile);
    return { id: row.id, customer };
  }

  async removeForAgent(user: AccessPayload, id: string) {
    const agent = await this.agents.findById(user.sub);
    if (!agent || agent.status !== 'active') throw new UnauthorizedException('Sign in again.');
    if (!isValidObjectId(id)) throw new NotFoundException('That credit report is not on this desk.');
    const row = await this.reports.findOneAndDelete({ _id: id, agentId: agent.code });
    if (!row) throw new NotFoundException('That credit report is not on this desk.');
    const customer = await this.customers.refreshAfterReportRemoved(row.agentId, row.mobile);
    return { id: row.id, customer };
  }

  async download(id: string) {
    const row = await this.reports.findById(id);
    if (!row) throw new NotFoundException('That credit report is not on this desk.');
    return this.fileFor(row);
  }

  async downloadForAgent(user: AccessPayload, id: string) {
    const agent = await this.agents.findById(user.sub);
    if (!agent || agent.status !== 'active') throw new UnauthorizedException('Sign in again.');
    if (!isValidObjectId(id)) throw new NotFoundException('That credit report is not on this desk.');
    const row = await this.reports.findById(id);
    if (!row || row.agentId !== agent.code) throw new NotFoundException('That credit report is not on this desk.');
    return this.fileFor(row);
  }

  private async fileFor(row: CreditReportDocument) {
    const name = `${row.firstName} ${row.lastName}`.trim();
    const filename = `credit-report-${name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'customer'}.pdf`;
    return { filename, body: await buildCreditReportPdf(row) };
  }

  private customerFromCheck(agent: AgentDocument, input: CreateCreditReportDto, score: number | null, ready: boolean) {
    return {
      agentId: agent.code,
      agentName: agent.name,
      firstName: input.firstName,
      lastName: input.lastName,
      mobile: input.mobile,
      email: input.email,
      pan: input.pan,
      dateOfBirth: input.dateOfBirth,
      score,
      ready,
    };
  }

  private present(row: CreditReportDocument) {
    return {
      id: row.id,
      agentId: row.agentId,
      agentName: row.agentName,
      name: `${row.firstName} ${row.lastName}`.trim(),
      mobile: row.mobile,
      email: row.email,
      pan: row.panMasked,
      dateOfBirth: row.dateOfBirth,
      status: row.status,
      score: row.score ?? null,
      gender: row.gender ?? null,
      reportUrl: row.reportUrl ?? null,
      message: row.message,
      createdAt: row.get('createdAt'),
    };
  }
}

function maskPan(pan: string) {
  if (pan.length < 6) return pan;
  return `${pan.slice(0, 5)}••••${pan.slice(-1)}`;
}

function findScore(value: unknown, depth = 0): number | null {
  if (depth > 12) return null;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findScore(item, depth + 1);
      if (found) return found;
    }
    return null;
  }
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  for (const key of ['BureauScore', 'bureauScore', 'credit_score', 'CreditScore', 'cibil_score', 'CibilScore', 'riskScore', 'RiskScore', 'scoreValue', 'ScoreValue', 'score', 'Score']) {
    const parsed = scoreNumber(record[key]);
    if (parsed) return parsed;
  }
  for (const child of Object.values(record)) {
    const found = findScore(child, depth + 1);
    if (found) return found;
  }
  if (depth !== 0) return null;
  const match = JSON.stringify(record).match(/"BureauScore"\s*:\s*"?(\d{3})"?/);
  const fallback = match ? Number(match[1]) : NaN;
  return fallback >= 300 && fallback <= 900 ? fallback : null;
}

function scoreNumber(value: unknown): number | null {
  if (typeof value === 'number' || typeof value === 'string') {
    const parsed = Number(String(value).trim());
    return parsed >= 300 && parsed <= 900 ? parsed : null;
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  for (const key of ['BureauScore', 'value', 'Value']) {
    const parsed = scoreNumber(record[key]);
    if (parsed) return parsed;
  }
  return null;
}
