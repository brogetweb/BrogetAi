import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Param,
  Post,
  Req,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AccessTokenGuard } from '../auth/access-token.guard';
import { TravellerAccessPayload } from '../book/book.types';
import { TravellerTokenGuard } from '../book/traveller-token.guard';
import { AirSearchDto } from './dto/air-search.dto';
import { FlightCheckoutDto, FlightPayWebhookDto, FlightQuoteDto } from './dto/flight-checkout.dto';
import { TicketPdfDto } from './dto/ticket-pdf.dto';
import { BosFlightClient } from './bos-flight.client';
import { WebhookSecretGuard } from '../wallet/webhook-secret.guard';
import { FlightOrdersService } from './flight-orders.service';
import { FlightsService } from './flights.service';

@Controller('book/flights')
export class FlightsController {
  constructor(
    private readonly flights: FlightsService,
    private readonly bos: BosFlightClient,
    private readonly orders: FlightOrdersService,
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

  @Post('quote')
  @HttpCode(200)
  quote(@Body() body: FlightQuoteDto) {
    return this.orders.quote(body);
  }

  @Post('checkout')
  @HttpCode(200)
  @UseGuards(TravellerTokenGuard)
  checkout(@Req() req: { traveller: TravellerAccessPayload }, @Body() body: FlightCheckoutDto) {
    return this.orders.createCheckout(req.traveller.sub, body);
  }

  @Get('orders/:requestId')
  @UseGuards(TravellerTokenGuard)
  orderStatus(@Req() req: { traveller: TravellerAccessPayload }, @Param('requestId') requestId: string) {
    return this.orders.statusForTraveller(req.traveller.sub, requestId);
  }

  @Post('orders/:requestId/demo-pay')
  @HttpCode(200)
  @UseGuards(TravellerTokenGuard)
  demoPay(@Req() req: { traveller: TravellerAccessPayload }, @Param('requestId') requestId: string) {
    return this.orders.confirmDemo(req.traveller.sub, requestId);
  }

  @Get('orders')
  @UseGuards(AccessTokenGuard)
  adminOrders() {
    return this.orders.listForAdmin();
  }

  @Post('pay/webhook/:secret')
  @UseGuards(WebhookSecretGuard)
  @HttpCode(200)
  payWebhookPost(@Req() req: Request) {
    return this.handlePayWebhook(req);
  }

  @Get('pay/webhook/:secret')
  @UseGuards(WebhookSecretGuard)
  payWebhookGet(@Req() req: Request) {
    return this.handlePayWebhook(req);
  }

  @Get('pay/open/:requestId')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async payOpen(@Param('requestId') requestId: string, @Res() res: Response) {
    const html = await this.orders.payOpenPage(requestId);
    res.type('html').send(html);
  }

  @Get('pay/return')
  payReturn(@Res() res: Response) {
    res
      .type('html')
      .send(
        '<!doctype html><html><body style="font-family:sans-serif;padding:32px"><h1>Payment sent</h1><p>Return to the Book by Broget AI app. Your ticket appears after Broget Pay confirms.</p></body></html>',
      );
  }

  @Post('search')
  @HttpCode(200)
  @UseGuards(TravellerTokenGuard)
  search(@Body() body: AirSearchDto) {
    return this.flights.search(body);
  }

  @Post('search/guest')
  @HttpCode(200)
  searchGuest(@Body() body: AirSearchDto) {
    return this.flights.search(body);
  }

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

  private handlePayWebhook(req: Request) {
    const source = (req.method === 'GET' ? req.query : req.body) as Record<string, unknown>;
    const input: FlightPayWebhookDto = {
      status: source?.status as FlightPayWebhookDto['status'],
      status_text: source?.status_text as string | undefined,
      order_id: source?.order_id as string | undefined,
      amount: source?.amount as number | string | undefined,
      utr: source?.utr as string | undefined,
    };
    return this.orders.payWebhook(input);
  }
}
