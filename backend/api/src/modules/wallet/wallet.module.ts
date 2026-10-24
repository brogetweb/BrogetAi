import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Agent, AgentSchema } from '../agents/schemas/agent.schema';
import { AuthModule } from '../auth/auth.module';
import { HouseWallet, HouseWalletSchema } from './schemas/house-wallet.schema';
import { WalletEntry, WalletEntrySchema } from './schemas/wallet-entry.schema';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: WalletEntry.name, schema: WalletEntrySchema },
      { name: HouseWallet.name, schema: HouseWalletSchema },
      { name: Agent.name, schema: AgentSchema },
    ]),
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}