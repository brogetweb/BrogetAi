import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { CreateAgentDto } from './dto/create-agent.dto';
import { Agent, AgentDocument } from './schemas/agent.schema';

@Injectable()
export class AgentsService {
  constructor(@InjectModel(Agent.name) private readonly agents: Model<AgentDocument>) {}

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
    return this.present(agent);
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
