import { createHash, randomBytes } from 'crypto';
import { BadRequestException, HttpException, HttpStatus, Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
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

/** Wrong current-password attempts allowed per agent before a short lock-out. */
const PASSWORD_ATTEMPTS = 5;
const PASSWORD_LOCK_MS = 15 * 60 * 1000;

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly passwordFailures = new Map<string, { count: number; until: number }>();

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
    await this.users.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });
    return this.issue({ id: user.id, email: user.email, role: 'super_admin' }, this.present(user));
  }

  async loginAgent(email: string, password: string) {
    const agent = await this.agents.findOne({ email });
    const matches = agent ? await bcrypt.compare(password, agent.passwordHash) : false;
    if (!agent || !matches) throw new UnauthorizedException(mismatch);
    if (agent.status !== 'active') throw new UnauthorizedException('This agent account is blocked.');
    await this.agents.updateOne({ _id: agent._id }, { $set: { lastLoginAt: new Date() } });
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

  async agentProfile(agentId: string) {
    return this.presentAgentProfile(await this.activeAgent(agentId));
  }

  async updateAgentProfile(agentId: string, input: { name: string; phone: string; city: string }) {
    const agent = await this.activeAgent(agentId);
    agent.name = input.name;
    agent.phone = input.phone;
    agent.city = input.city;
    await agent.save();
    return this.presentAgentProfile(agent);
  }

  async changeAgentPassword(agentId: string, currentPassword: string, newPassword: string) {
    const agent = await this.activeAgent(agentId);
    const key = String(agent._id);
    const failures = this.passwordFailures.get(key);
    if (failures && failures.until > Date.now() && failures.count >= PASSWORD_ATTEMPTS) {
      throw new HttpException('Too many wrong attempts. Try again in 15 minutes.', HttpStatus.TOO_MANY_REQUESTS);
    }
    if (!(await bcrypt.compare(currentPassword, agent.passwordHash))) {
      const next = failures && failures.until > Date.now() ? failures.count + 1 : 1;
      this.passwordFailures.set(key, { count: next, until: Date.now() + PASSWORD_LOCK_MS });
      throw new BadRequestException('Your current password is not correct.');
    }
    this.passwordFailures.delete(key);
    if (await bcrypt.compare(newPassword, agent.passwordHash)) {
      throw new BadRequestException('Choose a new password that is different from the current one.');
    }
    agent.passwordHash = await bcrypt.hash(newPassword, 12);
    agent.passwordChangedAt = new Date();
    agent.mustChangePassword = false;
    await agent.save();
    // Every existing session (other browsers, the mobile app) must sign in again with the new password.
    await this.revokeAgentSessions(key);
    const session = await this.issue({ id: agent.id, email: agent.email, role: 'agent' }, this.presentAgent(agent));
    return { ...session, profile: this.presentAgentProfile(agent) };
  }

  async logoutAllAgent(agentId: string) {
    const agent = await this.activeAgent(agentId);
    const revoked = await this.revokeAgentSessions(String(agent._id));
    return { ok: true, revoked };
  }

  private async revokeAgentSessions(agentId: string) {
    const result = await this.sessions.updateMany({ userId: agentId, role: 'agent', revokedAt: { $exists: false } }, { $set: { revokedAt: new Date() } });
    return result.modifiedCount;
  }

  private async activeAgent(agentId: string) {
    const agent = await this.agents.findById(agentId);
    if (!agent || agent.status !== 'active') throw new UnauthorizedException('Sign in again.');
    return agent;
  }

  private presentAgentProfile(agent: AgentDocument) {
    return {
      ...this.presentAgent(agent),
      code: agent.code,
      status: agent.status,
      memberSince: agent.get('createdAt') ?? null,
      lastLoginAt: agent.lastLoginAt ?? null,
      passwordChangedAt: agent.passwordChangedAt ?? null,
      mustChangePassword: agent.mustChangePassword === true,
    };
  }

  // ---------- super admin's own account

  async adminProfile(userId: string) {
    return this.presentAdminProfile(await this.activeAdmin(userId));
  }

  async updateAdminProfile(userId: string, name: string) {
    const user = await this.activeAdmin(userId);
    user.name = name;
    await user.save();
    return this.presentAdminProfile(user);
  }

  async changeAdminPassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.activeAdmin(userId);
    const key = `admin:${user.id}`;
    const failures = this.passwordFailures.get(key);
    if (failures && failures.until > Date.now() && failures.count >= PASSWORD_ATTEMPTS) {
      throw new HttpException('Too many wrong attempts. Try again in 15 minutes.', HttpStatus.TOO_MANY_REQUESTS);
    }
    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
      const next = failures && failures.until > Date.now() ? failures.count + 1 : 1;
      this.passwordFailures.set(key, { count: next, until: Date.now() + PASSWORD_LOCK_MS });
      throw new BadRequestException('Your current password is not correct.');
    }
    this.passwordFailures.delete(key);
    if (await bcrypt.compare(newPassword, user.passwordHash)) {
      throw new BadRequestException('Choose a new password that is different from the current one.');
    }
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.passwordChangedAt = new Date();
    await user.save();
    await this.sessions.updateMany({ userId: user._id, role: { $in: ['super_admin', null] }, revokedAt: { $exists: false } }, { $set: { revokedAt: new Date() } });
    const session = await this.issue({ id: user.id, email: user.email, role: 'super_admin' }, this.present(user));
    return { ...session, profile: this.presentAdminProfile(user) };
  }

  private async activeAdmin(userId: string) {
    const user = await this.users.findById(userId);
    if (!user || user.status !== 'active' || user.role !== 'super_admin') throw new UnauthorizedException('Sign in again.');
    return user;
  }

  private presentAdminProfile(user: UserDocument) {
    return {
      ...this.present(user),
      memberSince: user.get('createdAt') ?? null,
      lastLoginAt: user.lastLoginAt ?? null,
      passwordChangedAt: user.passwordChangedAt ?? null,
    };
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
