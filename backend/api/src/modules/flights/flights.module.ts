import { Module } from '@nestjs/common';
import { BookModule } from '../book/book.module';
import { BosFlightClient } from './bos-flight.client';
import { FlightsController } from './flights.controller';
import { FlightsService } from './flights.service';

@Module({
  imports: [BookModule],
  controllers: [FlightsController],
  providers: [BosFlightClient, FlightsService],
  exports: [BosFlightClient, FlightsService],
})
export class FlightsModule {}
