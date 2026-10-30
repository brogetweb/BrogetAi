import { Body, Controller, Get, Header, HttpCode, Post, StreamableFile, UseGuards } from '@nestjs/common';
import { TravellerTokenGuard } from '../book/traveller-token.guard';
import { AirSearchDto } from './dto/air-search.dto';
import { TicketPdfDto } from './dto/ticket-pdf.dto';
import { BosFlightClient } from './bos-flight.client';
import { FlightsService } from './flights.service';

@Controller('book/flights')
export class FlightsController {
  constructor(
    private readonly flights: FlightsService,
    private readonly bos: BosFlightClient,
  ) {}

  @Get('health')
  health() {
    const mock = this.bos.mockEnabled();
    return {
      ok: true,
      mock,
      mode: mock ? 'local_mock' : 'live_bos',
      registrationId: this.bos.registrationId() || null,
      baseUrl: this.bos.baseUrl(),
      ipAddress: mock ? null : this.bos.ipAddress() || null,
      secretConfigured: Boolean(this.bos.clientSecret()),
      publicKeyConfigured: Boolean(this.bos.publicKey()),
      note: mock ? 'Local mock flights. Set BOS_FLIGHT_MOCK=false later for live IP/UAT.' : 'Live BOS Flight API',
    };
  }

  @Post('search')
  @HttpCode(200)
  @UseGuards(TravellerTokenGuard)
  search(@Body() body: AirSearchDto) {
    return this.flights.search(body);
  }

  /** Local/dev helper — same search without traveller token. */
  @Post('search/guest')
  @HttpCode(200)
  searchGuest(@Body() body: AirSearchDto) {
    return this.flights.search(body);
  }

  /** E-ticket PDF (mock now; live AirReprint later). */
  @Post('ticket-pdf')
  @HttpCode(200)
  @Header('Access-Control-Expose-Headers', 'Content-Disposition, X-Ticket-PNR, X-Ticket-Mock')
  async ticketPdf(@Body() body: TicketPdfDto) {
    const file = await this.flights.ticketPdf(body);
    return new StreamableFile(file.body, {
      type: 'application/pdf',
      disposition: `attachment; filename="${file.filename}"`,
    });
  }

  @Post('ticket-pdf/meta')
  @HttpCode(200)
  async ticketPdfMeta(@Body() body: TicketPdfDto) {
    const file = await this.flights.ticketPdf(body);
    return {
      ok: true,
      pnr: file.pnr,
      filename: file.filename,
      mock: file.mock,
      delivery: file.delivery,
      downloadPath: '/api/v1/book/flights/ticket-pdf',
    };
  }
}
