import {
  BadGatewayException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import { Model } from 'mongoose';
import { Traveller, TravellerDocument } from '../book/schemas/traveller.schema';
import { FlightCheckoutDto, FlightPayWebhookDto, FlightQuoteDto } from './dto/flight-checkout.dto';
import { paiseToRupees, quoteFlightPrice, rupeesToPaise } from './flight-pricing';
import { FlightOrder, FlightOrderDocument } from './schemas/flight-order.schema';

@Injectable()
export class FlightOrdersService {
  private readonly logger = new Logger(FlightOrdersService.name);

  constructor(
    @InjectModel(FlightOrder.name) private readonly orders: Model<FlightOrderDocument>,
    @InjectModel(Traveller.name) private readonly travellers: Model<TravellerDocument>,
    private readonly config: ConfigService,
  ) {}

  quote(input: FlightQuoteDto) {
    return quoteFlightPrice({ netFareRupees: input.netFare, sector: input.sector });
  }

  async createCheckout(travellerId: string, input: FlightCheckoutDto) {
    const traveller = await this.travellers.findById(travellerId);
    if (!traveller || traveller.status !== 'active') throw new UnauthorizedException('Sign in again.');

    const quote = quoteFlightPrice({ netFareRupees: input.netFare, sector: input.sector });
    const requestId = `FLT${randomBytes(6).toString('hex')}`;
    const lead = input.passengers[0];
    const payMobile = (input.payMobile || lead?.phone || traveller.phone || '').replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(payMobile)) {
      throw new BadGatewayException('A valid 10-digit mobile is required for payment.');
    }

    const order = await this.orders.create({
      requestId,
      travellerId: traveller._id,
      travellerName: traveller.fullName,
      travellerEmail: traveller.email,
      travellerPhone: traveller.phone,
      sector: quote.sector,
      markupPercent: quote.markupPercent,
      netFarePaise: quote.netFarePaise,
      markupPaise: quote.markupPaise,
      gstPaise: quote.gstPaise,
      totalPaise: quote.totalPaise,
      status: 'pending',
      paymentMode: this.hasGatewayKey() ? 'brogetpay' : 'demo',
      flight: input.flight as unknown as Record<string, unknown>,
      passengers: input.passengers as unknown as Record<string, unknown>[],
      note: 'Awaiting customer payment',
    });

    if (!this.hasGatewayKey()) {
      // Demo / keys not configured yet — app can open demo pay sheet and confirm.
      return this.presentCheckout(order, {
        paymentUrl: '',
        checkoutUrl: '',
        demo: true,
        message: 'Broget Pay key missing — use in-app demo pay (set BROGETPAY_API_KEY for live).',
      });
    }

    try {
      const result = await this.gateway('/pg/create-request', {
        apikey: this.apiKey(),
        mobile: payMobile,
        mobilenumber: payMobile,
        amount: quote.total.toFixed(2),
        request_id: requestId,
        order_id: requestId,
        redirect_url: `${this.publicUrl()}/api/v1/book/flights/pay/return`,
        remark1: 'Flight ticket',
        remark2: String(traveller.id),
      });
      const paymentUrl = readPaymentUrl(result);
      if (!paymentUrl) {
        await this.orders.updateOne({ _id: order._id }, { status: 'failed', note: 'Broget Pay did not return a payment link.' });
        throw new BadGatewayException('Broget Pay did not return a payment link.');
      }
      order.checkoutUrl = paymentUrl;
      await order.save();
      return this.presentCheckout(order, {
        paymentUrl: `${this.publicUrl()}/api/v1/book/flights/pay/open/${requestId}`,
        checkoutUrl: paymentUrl,
        demo: false,
      });
    } catch (error) {
      await this.orders.updateOne({ _id: order._id, status: 'pending' }, { status: 'failed', note: 'Payment create failed.' });
      throw error;
    }
  }

  async payOpenPage(requestId: string) {
    if (!/^FLT[A-Za-z0-9]+$/.test(requestId)) throw new NotFoundException();
    const order = await this.orders.findOne({ requestId });
    if (!order) throw new NotFoundException();
    const checkout = order.checkoutUrl || `${this.gatewayOrigin()}/payment/${requestId}`;
    const amount = paiseToRupees(order.totalPaise).toFixed(2);
    return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pay flight</title>
<style>body{font-family:sans-serif;margin:0;background:#f3f6fb;color:#0b1f3a}main{max-width:420px;margin:0 auto;padding:28px 20px}
h1{font-size:22px;margin:0 0 8px}.pay{display:block;text-align:center;background:#0066ff;color:#fff;text-decoration:none;font-weight:800;border-radius:14px;padding:16px;margin:18px 0}
.hint{color:#6b7a90;line-height:1.45;font-size:14px}.box{background:#fff;border:1px solid #e6ecf5;border-radius:14px;padding:14px;margin-top:12px}
.row{display:flex;justify-content:space-between;margin:6px 0;font-size:13px;font-weight:600}</style></head>
<body><main><h1>Pay ₹${amount}</h1>
<p class="hint">Broget fee + GST are included. Airline net fare goes to AO Pay wallet after ticket issue.</p>
<div class="box">
<div class="row"><span>AO Pay net</span><span>₹${paiseToRupees(order.netFarePaise).toFixed(2)}</span></div>
<div class="row"><span>Broget ${order.markupPercent}%</span><span>₹${paiseToRupees(order.markupPaise).toFixed(2)}</span></div>
<div class="row"><span>GST 18%</span><span>₹${paiseToRupees(order.gstPaise).toFixed(2)}</span></div>
<div class="row"><span>Total</span><span>₹${amount}</span></div>
</div>
<a class="pay" href="${escapeAttr(checkout)}">Open Broget Pay</a>
<p class="hint">After UPI confirms, return to the Book app. Ticket issues only after payment success.</p>
</main></body></html>`;
  }

  async payWebhook(input: FlightPayWebhookDto) {
    const orderId = String(input?.order_id || '');
    if (!orderId.startsWith('FLT')) return { received: true };
    const order = await this.orders.findOne({ requestId: orderId });
    if (!order || order.status === 'paid' || order.status === 'ticketed') return { received: true };

    const text = String(input.status_text ?? '').toUpperCase();
    const rawStatus = input.status as unknown;
    const failed = rawStatus === false || rawStatus === 0 || rawStatus === '0' || rawStatus === 'false' || text === 'FAILED';
    const success =
      !failed && (rawStatus === true || rawStatus === 1 || rawStatus === '1' || rawStatus === 'true' || text === 'SUCCESS');
    const paid = input.amount == null || input.amount === '' ? order.totalPaise : rupeesToPaise(Number(input.amount));

    if (!success || paid !== order.totalPaise) {
      await this.orders.updateOne(
        { _id: order._id, status: 'pending' },
        { status: 'failed', note: success ? 'Amount mismatch' : 'Broget Pay marked failed' },
      );
      return { received: true };
    }

    const claimed = await this.orders.findOneAndUpdate(
      { _id: order._id, status: 'pending' },
      { status: 'paid', utr: input.utr || undefined, note: 'Paid — issuing ticket' },
      { new: true },
    );
    if (!claimed) return { received: true };
    await this.issueTicket(claimed);
    return { received: true };
  }

  /** Demo confirm when BROGETPAY_API_KEY is not set. */
  async confirmDemo(travellerId: string, requestId: string) {
    const order = await this.orders.findOne({ requestId, travellerId });
    if (!order) throw new NotFoundException('Order not found.');
    if (order.status === 'ticketed' || order.status === 'paid') return this.presentOrder(order);
    if (this.hasGatewayKey() && order.paymentMode === 'brogetpay') {
      throw new BadGatewayException('Live Broget Pay order — complete payment in the gateway.');
    }
    const claimed = await this.orders.findOneAndUpdate(
      { _id: order._id, status: 'pending' },
      { status: 'paid', paymentMode: 'demo', utr: `DEMO${Date.now()}`, note: 'Demo payment confirmed' },
      { new: true },
    );
    if (!claimed) return this.presentOrder(order);
    return this.presentOrder(await this.issueTicket(claimed));
  }

  async statusForTraveller(travellerId: string, requestId: string) {
    const order = await this.orders.findOne({ requestId, travellerId });
    if (!order) throw new NotFoundException('Order not found.');
    return this.presentOrder(order);
  }

  async listForAdmin() {
    const rows = await this.orders.find().sort({ createdAt: -1 }).limit(200);
    return rows.map((row) => this.presentOrder(row));
  }

  private async issueTicket(order: FlightOrderDocument) {
    if (order.status === 'ticketed' && order.pnr) return order;
    const digits = order.requestId.replace(/\D/g, '');
    const pnr = `BG${(digits.slice(-6) || Date.now().toString().slice(-6)).toUpperCase()}`;
    const updated = await this.orders.findOneAndUpdate(
      { _id: order._id, status: { $in: ['paid', 'ticketed'] } },
      {
        status: 'ticketed',
        pnr,
        note: 'Ticketed. AO Pay wallet debit = net fare (live AirTicketing later). Customer PDF/email via Broget.',
      },
      { new: true },
    );
    this.logger.log(`Flight order ${order.requestId} ticketed PNR ${pnr}`);
    return updated ?? order;
  }

  private presentCheckout(
    order: FlightOrderDocument,
    extra: { paymentUrl: string; checkoutUrl: string; demo: boolean; message?: string },
  ) {
    return {
      ...this.presentOrder(order),
      paymentUrl: extra.paymentUrl,
      checkoutUrl: extra.checkoutUrl || order.checkoutUrl,
      demo: extra.demo,
      message: extra.message,
    };
  }

  private presentOrder(order: FlightOrderDocument) {
    const created = (order as FlightOrderDocument & { createdAt?: Date }).createdAt ?? new Date();
    const flight = order.flight ?? {};
    return {
      id: order.id,
      requestId: order.requestId,
      status: order.status,
      sector: order.sector,
      markupPercent: order.markupPercent,
      netFare: paiseToRupees(order.netFarePaise),
      markup: paiseToRupees(order.markupPaise),
      gst: paiseToRupees(order.gstPaise),
      total: paiseToRupees(order.totalPaise),
      moneyTo: {
        aoPayWallet: paiseToRupees(order.netFarePaise),
        brogetFee: paiseToRupees(order.markupPaise),
        gst: paiseToRupees(order.gstPaise),
        customerPaid: paiseToRupees(order.totalPaise),
      },
      pnr: order.pnr || '',
      utr: order.utr || '',
      paymentMode: order.paymentMode || '',
      travellerName: order.travellerName,
      travellerEmail: order.travellerEmail,
      travellerPhone: order.travellerPhone,
      route: `${flight['fromCode'] ?? ''} → ${flight['toCode'] ?? ''}`,
      airline: String(flight['airline'] ?? ''),
      flightCode: String(flight['flightCode'] ?? ''),
      date: String(flight['date'] ?? ''),
      note: order.note || '',
      createdAt: created instanceof Date ? created.toISOString() : new Date().toISOString(),
      passengers: order.passengers ?? [],
      flight,
    };
  }

  private hasGatewayKey() {
    return Boolean(this.config.get<string>('BROGETPAY_API_KEY')?.trim());
  }

  private apiKey() {
    const key = this.config.get<string>('BROGETPAY_API_KEY')?.trim();
    if (!key) throw new ServiceUnavailableException('Broget Pay is not configured.');
    return key;
  }

  private publicUrl() {
    const url = this.config.get<string>('PUBLIC_API_URL')?.trim().replace(/\/$/, '');
    if (!url) throw new ServiceUnavailableException('PUBLIC_API_URL is not configured.');
    return url;
  }

  private gatewayOrigin() {
    const base = this.config.get<string>('BROGETPAY_BASE_URL') || 'https://gateway.brogetpay.com/api';
    return new URL(base).origin;
  }

  private async gateway(path: string, body: Record<string, string>) {
    const base = (this.config.get<string>('BROGETPAY_BASE_URL')?.trim() || 'https://gateway.brogetpay.com/api').replace(/\/$/, '');
    let response: Response;
    try {
      response = await fetch(`${base}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': 'BrogetAI-Flights/1.0' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000),
      });
    } catch {
      throw new BadGatewayException('Broget Pay could not be reached.');
    }
    const text = await response.text();
    let payload: unknown = {};
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = {};
    }
    const record = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
    const ok = response.ok && record.status !== false && record.success !== false;
    if (!ok) {
      const message = typeof record.message === 'string' ? record.message : 'Broget Pay refused the request.';
      throw new BadGatewayException(message);
    }
    return record;
  }
}

function readPaymentUrl(payload: Record<string, unknown>) {
  const result = payload.result;
  if (!result || typeof result !== 'object') return '';
  const url = (result as Record<string, unknown>).payment_url;
  return typeof url === 'string' ? url : '';
}

function escapeAttr(value: string) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
