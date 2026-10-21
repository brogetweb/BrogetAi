import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Agent, AgentDocument } from '../agents/schemas/agent.schema';
import { AccessPayload } from '../auth/auth.types';
import { CloudinaryService } from '../media/cloudinary.service';
import { CreateKycDocumentDto } from './dto/create-kyc-document.dto';
import { KycDocument, KycDocumentDocument } from './schemas/kyc-document.schema';

@Injectable()
export class KycService {
  constructor(
    @InjectModel(KycDocument.name) private readonly documents: Model<KycDocumentDocument>,
    @InjectModel(Agent.name) private readonly agents: Model<AgentDocument>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(user: AccessPayload, input: CreateKycDocumentDto) {
    const agent = await this.agents.findById(user.sub);
    if (!agent || agent.status !== 'active') throw new UnauthorizedException('Sign in again.');
    let storedAs = '';
    if (input.dataBase64 && this.cloudinary.isConfigured()) {
      try {
        const buffer = Buffer.from(input.dataBase64, 'base64');
        const stored = await this.cloudinary.uploadPrivate(buffer, `${agent.code}-${input.kind}-${input.fileName}`);
        storedAs = stored.publicId;
      } catch {
        storedAs = '';
      }
    }
    const saved = await this.documents.create({
      agentId: agent.code,
      agentName: agent.name,
      kind: input.kind,
      fileName: input.fileName,
      status: 'In review',
      storedAs,
    });
    return this.present(saved);
  }

  async list() {
    const rows = await this.documents.find().sort({ createdAt: -1 }).limit(300);
    return rows.map((row) => this.present(row));
  }

  async remove(id: string) {
    if (!isValidObjectId(id)) throw new NotFoundException('That document was not found.');
    const row = await this.documents.findByIdAndDelete(id);
    if (!row) throw new NotFoundException('That document was not found.');
    return { id: row.id };
  }

  private present(row: KycDocumentDocument) {
    return {
      id: row.id,
      agentId: row.agentId,
      agentName: row.agentName,
      kind: row.kind,
      fileName: row.fileName,
      status: row.status,
      stored: Boolean(row.storedAs),
      createdAt: row.get('createdAt'),
    };
  }
}
