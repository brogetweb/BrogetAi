import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { Agent, AgentSchema } from './schemas/agent.schema';

@Module({
  imports: [AuthModule, MongooseModule.forFeature([{ name: Agent.name, schema: AgentSchema }])],
  controllers: [AgentsController],
  providers: [AgentsService],
})
export class AgentsModule {}
