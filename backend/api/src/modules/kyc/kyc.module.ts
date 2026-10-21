import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Agent, AgentSchema } from '../agents/schemas/agent.schema';
import { AuthModule } from '../auth/auth.module';
import { MediaModule } from '../media/media.module';
import { KycController } from './kyc.controller';
import { KycService } from './kyc.service';
import { KycDocument, KycDocumentSchema } from './schemas/kyc-document.schema';

@Module({
  imports: [AuthModule, MediaModule, MongooseModule.forFeature([{ name: KycDocument.name, schema: KycDocumentSchema }, { name: Agent.name, schema: AgentSchema }])],
  controllers: [KycController],
  providers: [KycService],
})
export class KycModule {}
