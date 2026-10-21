import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AgentsModule } from './modules/agents/agents.module';
import { CreditModule } from './modules/credit/credit.module';
import { CustomersModule } from './modules/customers/customers.module';
import { KycModule } from './modules/kyc/kyc.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { MediaModule } from './modules/media/media.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>('MONGODB_URI');
        if (!uri) throw new Error('MONGODB_URI is required');
        return { uri, serverSelectionTimeoutMS: 5000 };
      },
    }),
    MediaModule,
    HealthModule,
    AuthModule,
    AgentsModule,
    CreditModule,
    CustomersModule,
    KycModule,
  ],
})
export class AppModule {}
