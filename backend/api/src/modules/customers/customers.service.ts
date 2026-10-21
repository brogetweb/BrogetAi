import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Agent, AgentDocument } from '../agents/schemas/agent.schema';
import { AccessPayload } from '../auth/auth.types';
import { CreditReport, CreditReportDocument } from '../credit/schemas/credit-report.schema';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { Customer, CustomerDocument } from './schemas/customer.schema';

type CheckedCustomer = {
  agentId: string;
  agentName: string;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  pan: string;
  dateOfBirth: string;
  score: number | null;
  ready: boolean;
};

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private readonly customers: Model<CustomerDocument>,
    @InjectModel(Agent.name) private readonly agents: Model<AgentDocument>,
    @InjectModel(CreditReport.name) private readonly reports: Model<CreditReportDocument>,
  ) {}

  async create(user: AccessPayload, input: CreateCustomerDto) {
    const agent = await this.agentFor(user);
    const code = await this.nextCode();
    const saved = await this.customers.create({
      code,
      agentId: agent.code,
      agentName: agent.name,
      firstName: input.firstName,
      lastName: input.lastName,
      mobile: input.mobile,
      email: input.email,
      pan: input.pan,
      dateOfBirth: input.dateOfBirth,
      kyc: 'Pending',
    });
    return this.present(saved, true);
  }

  async mine(user: AccessPayload) {
    const agent = await this.agentFor(user);
    const rows = await this.customers.find({ agentId: agent.code }).sort({ createdAt: -1 });
    return rows.map((row) => this.present(row, true));
  }

  async list() {
    await this.syncCheckedCustomers();
    const rows = await this.customers.find().sort({ createdAt: -1 }).limit(300);
    return rows.map((row) => this.present(row, false));
  }

  async remove(code: string) {
    const row = await this.customers.findOneAndDelete({ code: code.toUpperCase() });
    if (!row) throw new NotFoundException('That customer was not found.');
    await this.reports.deleteMany({ agentId: row.agentId, mobile: row.mobile });
    return { id: row.code };
  }

  async refreshAfterReportRemoved(agentId: string, mobile: string) {
    const customer = await this.customers.findOne({ agentId, mobile });
    if (!customer) return null;
    const remaining = await this.reports.find({ agentId, mobile }).sort({ createdAt: -1 });
    const ready = remaining.find((report) => report.status === 'ready');
    const chosen = ready ?? remaining[0];
    if (!chosen) {
      await this.customers.updateOne({ _id: customer._id }, { $set: { cibil: 'Not checked' }, $unset: { score: 1 } });
      customer.cibil = 'Not checked';
      customer.score = undefined;
      return this.present(customer, false);
    }
    const cibil = chosen.status === 'ready' ? 'Checked' : 'Failed';
    if (chosen.score == null) {
      await this.customers.updateOne({ _id: customer._id }, { $set: { cibil }, $unset: { score: 1 } });
      customer.score = undefined;
    } else {
      await this.customers.updateOne({ _id: customer._id }, { $set: { cibil, score: chosen.score } });
      customer.score = chosen.score;
    }
    customer.cibil = cibil;
    return this.present(customer, false);
  }

  async upsertFromCheck(input: CheckedCustomer) {
    const existing = await this.customers.findOne({ agentId: input.agentId, mobile: input.mobile });
    const cibil = input.ready ? 'Checked' : 'Failed';
    if (existing) {
      existing.firstName = input.firstName;
      existing.lastName = input.lastName;
      existing.email = input.email;
      existing.dateOfBirth = input.dateOfBirth;
      existing.agentName = input.agentName;
      if (!input.pan.includes('•')) existing.pan = input.pan;
      if (input.score != null) existing.score = input.score;
      existing.cibil = cibil;
      await existing.save();
      return existing;
    }
    return this.customers.create({
      code: await this.nextCode(),
      agentId: input.agentId,
      agentName: input.agentName,
      firstName: input.firstName,
      lastName: input.lastName,
      mobile: input.mobile,
      email: input.email,
      pan: input.pan,
      dateOfBirth: input.dateOfBirth,
      kyc: 'Pending',
      score: input.score ?? undefined,
      cibil,
    });
  }

  private async syncCheckedCustomers() {
    const reports = await this.reports.find().sort({ createdAt: -1 }).limit(300);
    for (const report of reports) {
      const already = await this.customers.exists({ agentId: report.agentId, mobile: report.mobile });
      if (already && report.status !== 'ready') continue;
      await this.upsertFromCheck({
        agentId: report.agentId,
        agentName: report.agentName,
        firstName: report.firstName,
        lastName: report.lastName,
        mobile: report.mobile,
        email: report.email,
        pan: report.panMasked,
        dateOfBirth: report.dateOfBirth,
        score: report.score ?? null,
        ready: report.status === 'ready',
      });
    }
  }

  private async agentFor(user: AccessPayload) {
    const agent = await this.agents.findById(user.sub);
    if (!agent || agent.status !== 'active') throw new UnauthorizedException('Sign in again.');
    return agent;
  }

  private present(row: CustomerDocument, includePan: boolean) {
    return {
      id: row.code,
      agentId: row.agentId,
      agentName: row.agentName,
      name: `${row.firstName} ${row.lastName}`.trim(),
      firstName: row.firstName,
      lastName: row.lastName,
      mobile: row.mobile,
      email: row.email,
      pan: includePan ? row.pan : maskPan(row.pan),
      dateOfBirth: row.dateOfBirth,
      kyc: row.kyc,
      cibil: row.cibil || 'Not checked',
      score: row.score ?? null,
      createdAt: row.get('createdAt'),
    };
  }

  private async nextCode() {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const code = `C${String(Math.floor(1000 + Math.random() * 9000))}`;
      const taken = await this.customers.exists({ code });
      if (!taken) return code;
    }
    throw new ConflictException('Could not assign a customer ID. Try again.');
  }
}

function maskPan(pan: string) {
  if (pan.length < 6) return pan;
  return `${pan.slice(0, 5)}••••${pan.slice(-1)}`;
}
