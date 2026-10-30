import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { BosFlightClient } from './bos-flight.client';
import { AirSearchDto } from './dto/air-search.dto';
import { TicketPdfDto } from './dto/ticket-pdf.dto';
import { mockAirSearchRaw } from './flight-mock';
import { buildFlightTicketPdf } from './flight-ticket.pdf';

@Injectable()
export class FlightsService {
  private readonly logger = new Logger(FlightsService.name);

  constructor(private readonly bos: BosFlightClient) {}

  async search(input: AirSearchDto) {
    const origin = codeOf(input.origin);
    const destination = codeOf(input.destination);
    if (origin === destination) throw new BadGatewayException('Origin and destination must be different.');

    const requestId = this.bos.newRequestId();
    const mock = this.bos.mockEnabled();

    let raw: unknown;
    if (mock) {
      this.logger.log(`Local mock AirSearch ${origin}→${destination} (BOS_FLIGHT_MOCK=true)`);
      raw = mockAirSearchRaw({ requestId, origin, destination, travelDateIso: input.travelDate });
    } else {
      const tripInfo = [
        {
          origin,
          destination,
          travelDate: toBosDate(input.travelDate),
          trip_Id: 0,
        },
      ];
      if (input.bookingType === 1 && input.returnDate) {
        tripInfo.push({
          origin: destination,
          destination: origin,
          travelDate: toBosDate(input.returnDate),
          trip_Id: 0,
        });
      }

      const payload = {
        request_Id: requestId,
        imeI_Number: this.bos.imei(),
        travel_Type: 0,
        booking_Type: input.bookingType ?? 0,
        tripInfo,
        adult_Count: String(input.adults ?? 1),
        child_Count: String(input.children ?? 0),
        infant_Count: String(input.infants ?? 0),
        class_Of_Travel: input.cabin ?? '0',
        inventoryType: 0,
        source_Type: 0,
        srCitizen_Search: false,
        studentFare_Search: false,
        defenceFare_Search: false,
        filtered_Airline: [{ airline_Code: input.airlineCode?.trim() || '' }],
        registrationID: this.bos.registrationId(),
        ipAddress: this.bos.ipAddress(),
      };
      raw = await this.bos.airSearch(payload);
    }

    const header = asRecord(asRecord(raw).response_Header);
    const errorCode = String(header.error_Code ?? '');
    if (errorCode && errorCode !== '0000') {
      throw new BadGatewayException(String(header.error_Desc || 'Flight search failed.'));
    }

    const flights = flattenFlights(raw).map((flight) => presentFlight(flight));
    return {
      requestId: String(header.request_Id ?? requestId),
      searchKey: String(asRecord(raw).search_Key ?? ''),
      origin,
      destination,
      travelDate: input.travelDate,
      count: flights.length,
      mock,
      flights,
      provider: mock ? { mode: 'local_mock' } : raw,
    };
  }

  /**
   * Local/mock e-ticket PDF now. Live later: AirTicketing → AirReprint PDF from BOS.
   * AO Pay does not auto-mail/SMS end customers via this API alone — app/agency must deliver.
   */
  async ticketPdf(input: TicketPdfDto) {
    const pnr = (input.pnr?.trim() || `BG${input.bookingId.replace(/\D/g, '').slice(-6) || Date.now().toString().slice(-6)}`).toUpperCase();
    const body = await buildFlightTicketPdf({
      bookingId: input.bookingId,
      pnr,
      airline: input.airline,
      flightCode: input.flightCode,
      fromCode: input.fromCode.toUpperCase(),
      toCode: input.toCode.toUpperCase(),
      date: input.date,
      depart: input.depart,
      arrive: input.arrive,
      duration: input.duration || '',
      travellerName: input.travellerName,
      email: input.email,
      phone: input.phone,
      total: input.total,
      cabin: input.cabin,
    });
    return {
      body,
      filename: `eticket-${pnr}.pdf`,
      pnr,
      mock: this.bos.mockEnabled(),
      delivery: {
        emailByAoPay: false,
        smsByAoPay: false,
        note: 'Ticket PDF from Broget API. AO Pay/BOS Air API does not guarantee customer email/SMS — confirm with AO Pay account manager, or send from Broget after booking.',
      },
    };
  }
}

function codeOf(value: string) {
  const match = /\(([A-Z]{3})\)/i.exec(value);
  if (match) return match[1].toUpperCase();
  const trimmed = value.trim().toUpperCase();
  if (/^[A-Z]{3}$/.test(trimmed)) return trimmed;
  return trimmed.slice(0, 3);
}

/** YYYY-MM-DD → MM/DD/YYYY for BOS AirSearch. */
function toBosDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y}`;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function flattenFlights(raw: unknown) {
  const trips = asArray(asRecord(raw).tripDetails);
  const out: Record<string, unknown>[] = [];
  for (const trip of trips) {
    const flights = asArray(asRecord(trip).flights);
    for (const flight of flights) out.push(asRecord(flight));
  }
  return out;
}

function presentFlight(flight: Record<string, unknown>) {
  const segments = asArray(flight.segments).map((row) => asRecord(row));
  const first = segments[0] ?? {};
  const last = segments[segments.length - 1] ?? first;
  const fares = asArray(flight.fares).map((row) => asRecord(row));
  const cheapest = pickCheapestFare(fares);
  const fareDetail = asRecord(asArray(cheapest.fareDetails)[0]);
  const baggage = asRecord(fareDetail.free_Baggage);

  return {
    id: String(flight.flight_Id ?? ''),
    flightKey: String(flight.flight_Key ?? ''),
    airlineCode: String(flight.airline_Code ?? first.airline_Code ?? ''),
    airlineName: String(first.airline_Name ?? flight.airline_Code ?? 'Airline'),
    flightNumber: String(first.flight_Number ?? flight.flight_Numbers ?? ''),
    fromCode: String(flight.origin ?? first.origin ?? ''),
    toCode: String(flight.destination ?? last.destination ?? ''),
    fromCity: String(first.origin_City ?? ''),
    toCity: String(last.destination_City ?? ''),
    depart: timeOf(String(first.departure_DateTime ?? '')),
    arrive: timeOf(String(last.arrival_DateTime ?? '')),
    duration: String(first.duration ?? ''),
    stops: Math.max(0, segments.length - 1),
    isLcc: Boolean(flight.isLCC),
    refundable: Boolean(cheapest.refundable),
    food: String(cheapest.food_onboard ?? ''),
    cabinBaggage: String(baggage.hand_Baggage ?? ''),
    checkInBaggage: String(baggage.check_In_Baggage ?? ''),
    fareId: String(cheapest.fare_Id ?? ''),
    baseFare: Number(fareDetail.basic_Amount ?? 0),
    taxes: Number(fareDetail.airportTax_Amount ?? 0),
    price: Number(fareDetail.total_Amount ?? 0),
    currency: String(fareDetail.currency_Code ?? 'INR'),
    fares: fares.map((fare) => {
      const detail = asRecord(asArray(fare.fareDetails)[0]);
      const bag = asRecord(detail.free_Baggage);
      return {
        fareId: String(fare.fare_Id ?? ''),
        productClass: String(fare.productClass ?? ''),
        refundable: Boolean(fare.refundable),
        food: String(fare.food_onboard ?? ''),
        baseFare: Number(detail.basic_Amount ?? 0),
        taxes: Number(detail.airportTax_Amount ?? 0),
        total: Number(detail.total_Amount ?? 0),
        cabinBaggage: String(bag.hand_Baggage ?? ''),
        checkInBaggage: String(bag.check_In_Baggage ?? ''),
      };
    }),
    segments: segments.map((segment) => ({
      airlineCode: String(segment.airline_Code ?? ''),
      airlineName: String(segment.airline_Name ?? ''),
      flightNumber: String(segment.flight_Number ?? ''),
      origin: String(segment.origin ?? ''),
      destination: String(segment.destination ?? ''),
      originCity: String(segment.origin_City ?? ''),
      destinationCity: String(segment.destination_City ?? ''),
      depart: String(segment.departure_DateTime ?? ''),
      arrive: String(segment.arrival_DateTime ?? ''),
      duration: String(segment.duration ?? ''),
      aircraft: String(segment.aircraft_Type ?? ''),
    })),
  };
}

function pickCheapestFare(fares: Record<string, unknown>[]) {
  let best = fares[0] ?? {};
  let bestTotal = Number.POSITIVE_INFINITY;
  for (const fare of fares) {
    const detail = asRecord(asArray(fare.fareDetails)[0]);
    const total = Number(detail.total_Amount ?? Number.POSITIVE_INFINITY);
    if (total < bestTotal) {
      bestTotal = total;
      best = fare;
    }
  }
  return best;
}

function timeOf(value: string) {
  const match = /(\d{1,2}:\d{2})\s*$/.exec(value.trim());
  return match?.[1] ?? value;
}
