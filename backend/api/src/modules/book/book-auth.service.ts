import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { Model } from 'mongoose';
import { Session, SessionDocument } from '../auth/schemas/session.schema';
import { BookLoginDto, BookRegisterDto } from './dto/book-auth.dto';
import { PublicTraveller, TravellerAccessPayload } from './book.types';
import { Traveller, TravellerDocument } from './schemas/traveller.schema';

const mismatch = 'That email/phone or password does not match.';

@Injectable()
export class BookAuthService {
  constructor(
    @InjectModel(Traveller.name) private readonly travellers: Model<TravellerDocument>,
    @InjectModel(Session.name) private readonly sessions: Model<SessionDocument>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(input: BookRegisterDto) {
    const email = input.email.trim().toLowerCase();
    const phone = input.phone.trim();
    const exists = await this.travellers.findOne({ $or: [{ email }, { phone }] });
    if (exists) throw new ConflictException('An account with this email or phone already exists.');
    const traveller = await this.travellers.create({
      fullName: input.fullName.trim(),
      email,
      phone,
      city: input.city?.trim() || '',
      gender: input.gender || 'Male',
      status: 'active',
      passwordHash: await bcrypt.hash(input.password, 12),
    });
    return this.issue(traveller);
  }

  async login(input: BookLoginDto) {
    const key = input.emailOrPhone.trim().toLowerCase();
    const traveller = await this.travellers.findOne({
      $or: [{ email: key }, { phone: input.emailOrPhone.trim() }],
    });
    const matches = traveller ? await bcrypt.compare(input.password, traveller.passwordHash) : false;
    if (!traveller || !matches) throw new UnauthorizedException(mismatch);
    if (traveller.status !== 'active') throw new UnauthorizedException('This account is inactive.');
    return this.issue(traveller);
  }

  async me(travellerId: string): Promise<PublicTraveller> {
    const traveller = await this.travellers.findById(travellerId);
    if (!traveller || traveller.status !== 'active') throw new UnauthorizedException('Sign in again.');
    return this.present(traveller);
  }

  async updateProfile(travellerId: string, input: Partial<BookRegisterDto>) {
    const traveller = await this.travellers.findById(travellerId);
    if (!traveller || traveller.status !== 'active') throw new UnauthorizedException('Sign in again.');
    if (input.fullName?.trim()) traveller.fullName = input.fullName.trim();
    if (input.city !== undefined) traveller.city = input.city.trim();
    if (input.gender) traveller.gender = input.gender;
    if (input.phone?.trim() && input.phone.trim() !== traveller.phone) {
      const taken = await this.travellers.findOne({ phone: input.phone.trim(), _id: { $ne: traveller.id } });
      if (taken) throw new ConflictException('That phone is already in use.');
      traveller.phone = input.phone.trim();
    }
    await traveller.save();
    return this.present(traveller);
  }

  /** Super-admin: Book app travellers for Active users desk. */
  async listForAdmin() {
    const rows = await this.travellers.find().sort({ createdAt: -1 });
    return rows.map((row) => this.presentAdmin(row));
  }

  async setStatusForAdmin(id: string, status: 'active' | 'inactive') {
    const traveller = await this.travellers.findByIdAndUpdate(id, { status }, { new: true });
    if (!traveller) throw new NotFoundException('Traveller not found.');
    return this.presentAdmin(traveller);
  }

  private presentAdmin(traveller: TravellerDocument) {
    const created = traveller.get('createdAt');
    return {
      id: traveller.id,
      name: traveller.fullName,
      email: traveller.email,
      phone: traveller.phone,
      city: traveller.city || '',
      gender: traveller.gender || 'Male',
      status: traveller.status,
      bookings: 0,
      createdAt: created instanceof Date ? created.toISOString() : new Date().toISOString(),
    };
  }

  private async issue(traveller: TravellerDocument) {
    const refreshTtl = this.config.get<string>('JWT_REFRESH_TTL') ?? '7d';
    const accessTtl = this.config.get<string>('JWT_ACCESS_TTL') ?? '15m';
    const session = await this.sessions.create({
      userId: traveller.id,
      role: 'traveller',
      refreshTokenHash: this.hash(randomBytes(32).toString('hex')),
      expiresAt: new Date(Date.now() + this.ttlMs(refreshTtl)),
    });
    const refreshToken = await this.jwt.signAsync(
      { sub: traveller.id, sid: session.id, typ: 'refresh' },
      { secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'), expiresIn: this.ttlSeconds(refreshTtl) },
    );
    session.refreshTokenHash = this.hash(refreshToken);
    await session.save();
    const accessToken = await this.jwt.signAsync(
      { sub: traveller.id, email: traveller.email, role: 'traveller', typ: 'access' } satisfies TravellerAccessPayload,
      { secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'), expiresIn: this.ttlSeconds(accessTtl) },
    );
    return {
      tokenType: 'Bearer',
      accessToken,
      refreshToken,
      expiresIn: accessTtl,
      user: this.present(traveller),
    };
  }

  private present(traveller: TravellerDocument): PublicTraveller {
    return {
      id: traveller.id,
      fullName: traveller.fullName,
      email: traveller.email,
      phone: traveller.phone,
      city: traveller.city || '',
      gender: traveller.gender || 'Male',
      role: 'traveller',
    };
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
