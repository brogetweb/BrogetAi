import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Agent, AgentSchema } from '../agents/schemas/agent.schema';
import { AuthModule } from '../auth/auth.module';
import { CreditReport, CreditReportSchema } from '../credit/schemas/credit-report.schema';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { Customer, CustomerSchema } from './schemas/customer.schema';

@Module({
  imports: [AuthModule, MongooseModule.forFeature([{ name: Customer.name, schema: CustomerSchema }, { name: Agent.name, schema: AgentSchema }, { name: CreditReport.name, schema: CreditReportSchema }])],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
