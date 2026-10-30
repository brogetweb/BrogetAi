import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { BookModule } from '../book/book.module';
import { Traveller, TravellerSchema } from '../book/schemas/traveller.schema';
import { BosFlightClient } from './bos-flight.client';
import { FlightOrdersService } from './flight-orders.service';
import { FlightsController } from './flights.controller';
import { FlightsService } from './flights.service';
import { FlightOrder, FlightOrderSchema } from './schemas/flight-order.schema';

@Module({
  imports: [
    AuthModule,
    BookModule,
    MongooseModule.forFeature([
      { name: FlightOrder.name, schema: FlightOrderSchema },
      { name: Traveller.name, schema: TravellerSchema },
    ]),
  ],
  controllers: [FlightsController],
  providers: [BosFlightClient, FlightsService, FlightOrdersService],
  exports: [BosFlightClient, FlightsService, FlightOrdersService],
})
export class FlightsModule {}
