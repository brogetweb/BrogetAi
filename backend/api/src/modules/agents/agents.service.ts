import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { Session, SessionDocument } from '../auth/schemas/session.schema';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { Agent, AgentDocument } from './schemas/agent.schema';

@Injectable()
export class AgentsService {
  constructor(
    @InjectModel(Agent.name) private readonly agents: Model<AgentDocument>,
    @InjectModel(Session.name) private readonly sessions: Model<SessionDocument>,
  ) {}

  async list() {
    const rows = await this.agents.find().sort({ createdAt: -1 });
    return rows.map((agent) => this.present(agent));
  }

  async create(input: CreateAgentDto) {
    const emailTaken = await this.agents.exists({ email: input.email });
    if (emailTaken) throw new ConflictException('An agent with this email already exists.');
    const code = await this.nextCode();
    const agent = await this.agents.create({
      code,
      name: input.name,
      email: input.email,
      phone: input.phone,
      city: input.city,
      status: 'active',
      passwordHash: await bcrypt.hash(input.password, 12),
    });
    return this.present(agent);
  }

  async setStatus(code: string, status: 'active' | 'inactive') {
    const agent = await this.agents.findOneAndUpdate({ code: code.toUpperCase() }, { status }, { new: true });
    if (!agent) throw new NotFoundException('That agent was not found.');
    // A blocked agent is signed out everywhere straight away.
    if (status === 'inactive') await this.revokeSessions(agent);
    return this.present(agent);
  }

  /** Super admin edits name, email, mobile and city. A new login email signs the agent out everywhere. */
  async update(code: string, input: UpdateAgentDto) {
    const agent = await this.find(code);
    if (input.email !== agent.email && (await this.agents.exists({ email: input.email, _id: { $ne: agent._id } }))) {
      throw new ConflictException('Another agent already uses this email.');
    }
    const emailChanged = input.email !== agent.email;
    agent.name = input.name;
    agent.email = input.email;
    agent.phone = input.phone;
    agent.city = input.city;
    await agent.save();
    if (emailChanged) await this.revokeSessions(agent);
    return this.present(agent);
  }

  /** Super admin sets a new password. All sessions end; the agent must choose their own password after signing in. */
  async resetPassword(code: string, newPassword: string) {
    const agent = await this.find(code);
    agent.passwordHash = await bcrypt.hash(newPassword, 12);
    agent.passwordChangedAt = new Date();
    agent.mustChangePassword = true;
    await agent.save();
    const signedOut = await this.revokeSessions(agent);
    return { ...this.present(agent), signedOut };
  }

  async logoutAll(code: string) {
    const agent = await this.find(code);
    return { id: agent.code, signedOut: await this.revokeSessions(agent) };
  }

  private async find(code: string) {
    const agent = await this.agents.findOne({ code: code.toUpperCase() });
    if (!agent) throw new NotFoundException('That agent was not found.');
    return agent;
  }

  private async revokeSessions(agent: AgentDocument) {
    const result = await this.sessions.updateMany({ userId: agent._id, role: 'agent', revokedAt: { $exists: false } }, { $set: { revokedAt: new Date() } });
    return result.modifiedCount;
  }

  async remove(code: string) {
    const agent = await this.agents.findOneAndDelete({ code: code.toUpperCase() });
    if (!agent) throw new NotFoundException('That agent was not found.');
    return { id: agent.code };
  }

  private present(agent: AgentDocument) {
    return {
      id: agent.code,
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      city: agent.city,
      status: agent.status,
      createdAt: agent.get('createdAt') ?? null,
      lastLoginAt: agent.lastLoginAt ?? null,
      passwordChangedAt: agent.passwordChangedAt ?? null,
      mustChangePassword: agent.mustChangePassword === true,
    };
  }

  private async nextCode() {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const code = `BG${String(Math.floor(1000 + Math.random() * 9000))}`;
      const taken = await this.agents.exists({ code });
      if (!taken) return code;
    }
    throw new ConflictException('Could not assign an agent ID. Try again.');
  }
}
