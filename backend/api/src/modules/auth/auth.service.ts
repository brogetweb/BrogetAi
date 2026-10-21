import { createHash, randomBytes } from 'crypto';
import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { Agent, AgentDocument } from '../agents/schemas/agent.schema';
import { AccessPayload, PublicAdmin, PublicAgent, RefreshPayload } from './auth.types';
import { Session, SessionDocument } from './schemas/session.schema';
import { User, UserDocument } from './schemas/user.schema';

const mismatch = 'That email or password does not match.';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private readonly users: Model<UserDocument>,
    @InjectModel(Agent.name) private readonly agents: Model<AgentDocument>,
    @InjectModel(Session.name) private readonly sessions: Model<SessionDocument>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    const email = this.config.get<string>('SUPER_ADMIN_EMAIL')?.trim().toLowerCase();
    const password = this.config.get<string>('SUPER_ADMIN_PASSWORD');
    const name = this.config.get<string>('SUPER_ADMIN_NAME')?.trim() || 'Super Admin';
    if (!email || !password) return;
    const existing = await this.users.findOne({ email });
    if (existing) return;
    await this.users.create({
      email,
      name,
      role: 'super_admin',
      status: 'active',
      passwordHash: await bcrypt.hash(password, 12),
    });
  }

  async login(email: string, password: string) {
    const user = await this.users.findOne({ email });
    const matches = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!user || !matches || user.role !== 'super_admin') throw new UnauthorizedException(mismatch);
    if (user.status !== 'active') throw new UnauthorizedException('This account is inactive.');
    return this.issue({ id: user.id, email: user.email, role: 'super_admin' }, this.present(user));
  }

  async loginAgent(email: string, password: string) {
    const agent = await this.agents.findOne({ email });
    const matches = agent ? await bcrypt.compare(password, agent.passwordHash) : false;
    if (!agent || !matches) throw new UnauthorizedException(mismatch);
    if (agent.status !== 'active') throw new UnauthorizedException('This agent account is blocked.');
    return this.issue({ id: agent.id, email: agent.email, role: 'agent' }, this.presentAgent(agent));
  }

  async refresh(refreshToken: string) {
    const payload = await this.readRefresh(refreshToken);
    const session = await this.sessions.findById(payload.sid);
    if (!session || session.revokedAt || session.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Sign in again.');
    }
    if (session.refreshTokenHash !== this.hash(refreshToken) || session.userId.toString() !== payload.sub) {
      throw new UnauthorizedException('Sign in again.');
    }
    if (!session.role) session.role = 'super_admin';
    session.revokedAt = new Date();
    await session.save();
    if (session.role === 'agent') {
      const agent = await this.agents.findById(session.userId);
      if (!agent || agent.status !== 'active') throw new UnauthorizedException('Sign in again.');
      return this.issue({ id: agent.id, email: agent.email, role: 'agent' }, this.presentAgent(agent));
    }
    const user = await this.users.findById(session.userId);
    if (!user || user.status !== 'active' || user.role !== 'super_admin') {
      throw new UnauthorizedException('Sign in again.');
    }
    return this.issue({ id: user.id, email: user.email, role: 'super_admin' }, this.present(user));
  }

  async logout(refreshToken: string) {
    try {
      const payload = await this.readRefresh(refreshToken);
      await this.sessions.updateOne(
        { _id: payload.sid, refreshTokenHash: this.hash(refreshToken), revokedAt: { $exists: false } },
        { $set: { revokedAt: new Date() } },
      );
    } catch {
      return { ok: true };
    }
    return { ok: true };
  }

  async me(userId: string): Promise<PublicAdmin> {
    const user = await this.users.findById(userId);
    if (!user || user.status !== 'active' || user.role !== 'super_admin') {
      throw new UnauthorizedException('Sign in again.');
    }
    return this.present(user);
  }

  private async issue(account: { id: string; email: string; role: 'super_admin' | 'agent' }, user: PublicAdmin | PublicAgent) {
    const refreshTtl = this.config.get<string>('JWT_REFRESH_TTL') ?? '7d';
    const accessTtl = this.config.get<string>('JWT_ACCESS_TTL') ?? '15m';
    const session = await this.sessions.create({
      userId: account.id,
      role: account.role,
      refreshTokenHash: this.hash(randomBytes(32).toString('hex')),
      expiresAt: new Date(Date.now() + this.ttlMs(refreshTtl)),
    });
    const refreshToken = await this.jwt.signAsync(
      { sub: account.id, sid: session.id, typ: 'refresh' } satisfies RefreshPayload,
      { secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'), expiresIn: this.ttlSeconds(refreshTtl) },
    );
    session.refreshTokenHash = this.hash(refreshToken);
    await session.save();
    const accessToken = await this.jwt.signAsync(
      { sub: account.id, email: account.email, role: account.role, typ: 'access' } satisfies AccessPayload,
      { secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'), expiresIn: this.ttlSeconds(accessTtl) },
    );
    return {
      tokenType: 'Bearer',
      accessToken,
      refreshToken,
      expiresIn: accessTtl,
      user,
    };
  }

  private present(user: UserDocument): PublicAdmin {
    return { id: user.id, email: user.email, name: user.name, role: 'super_admin' };
  }

  private presentAgent(agent: AgentDocument): PublicAgent {
    return {
      id: agent.code,
      email: agent.email,
      name: agent.name,
      phone: agent.phone,
      city: agent.city,
      role: 'agent',
    };
  }

  private async readRefresh(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync<RefreshPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
      if (payload.typ !== 'refresh' || !payload.sid || !payload.sub) throw new UnauthorizedException('Sign in again.');
      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Sign in again.');
    }
  }

  private hash(value: string) {
    return createHash('sha256').update(value).digest('hex');
  }

  private ttlSeconds(ttl: string) {
    return Math.max(60, Math.floor(this.ttlMs(ttl) / 1000));
  }

  private ttlMs(ttl: string) {
    const match = /^(\d+)([mhd])$/.exec(ttl.trim());
    if (!match) return 7 * 24 * 60 * 60 * 1000;
    const amount = Number(match[1]);
    if (match[2] === 'm') return amount * 60 * 1000;
    if (match[2] === 'h') return amount * 60 * 60 * 1000;
    return amount * 24 * 60 * 60 * 1000;
  }
}
