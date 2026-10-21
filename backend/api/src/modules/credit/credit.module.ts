import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Agent, AgentSchema } from '../agents/schemas/agent.schema';
import { AuthModule } from '../auth/auth.module';
import { CustomersModule } from '../customers/customers.module';
import { CreditController } from './credit.controller';
import { CreditService } from './credit.service';
import { CreditReport, CreditReportSchema } from './schemas/credit-report.schema';

@Module({
  imports: [
    AuthModule,
    CustomersModule,
    MongooseModule.forFeature([
      { name: CreditReport.name, schema: CreditReportSchema },
      { name: Agent.name, schema: AgentSchema },
    ]),
  ],
  controllers: [CreditController],
  providers: [CreditService],
})
export class CreditModule {}
