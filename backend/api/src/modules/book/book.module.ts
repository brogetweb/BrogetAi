import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { Session, SessionSchema } from '../auth/schemas/session.schema';
import { BookAdminController } from './book-admin.controller';
import { BookAuthService } from './book-auth.service';
import { BookController } from './book.controller';
import { Traveller, TravellerSchema } from './schemas/traveller.schema';
import { TravellerTokenGuard } from './traveller-token.guard';

@Module({
  imports: [
    AuthModule,
    JwtModule.register({}),
    MongooseModule.forFeature([
      { name: Traveller.name, schema: TravellerSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
  ],
  controllers: [BookController, BookAdminController],
  providers: [BookAuthService, TravellerTokenGuard],
  exports: [BookAuthService, TravellerTokenGuard, JwtModule],
})
export class BookModule {}
