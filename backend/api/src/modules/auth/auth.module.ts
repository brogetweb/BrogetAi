import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AccessTokenGuard } from './access-token.guard';
import { AgentTokenGuard } from './agent-token.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Agent, AgentSchema } from '../agents/schemas/agent.schema';
import { Session, SessionSchema } from './schemas/session.schema';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    JwtModule.register({}),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
      { name: Agent.name, schema: AgentSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenGuard, AgentTokenGuard],
  exports: [AuthService, AccessTokenGuard, AgentTokenGuard, JwtModule],
})
export class AuthModule {}
