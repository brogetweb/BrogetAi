import { Body, Controller, Get, Logger, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AccessTokenGuard } from '../auth/access-token.guard';
import { AgentTokenGuard } from '../auth/agent-token.guard';
import { AccessPayload } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreatePayoutDto, CreateTopupDto, PayinWebhookDto, PayoutWebhookDto } from './dto/wallet.dto';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  private readonly logger = new Logger(WalletController.name);

  constructor(private readonly wallet: WalletService) {}

  @Get('house')
  @UseGuards(AccessTokenGuard)
  house() {
    return this.wallet.houseSnapshot();
  }

  @Get()
  @UseGuards(AgentTokenGuard)
  snapshot(@CurrentUser() user: AccessPayload) {
    return this.wallet.snapshot(user.sub);
  }

  @Post('topups')
  @UseGuards(AgentTokenGuard)
  topup(@CurrentUser() user: AccessPayload, @Body() body: CreateTopupDto) {
    return this.wallet.createTopup(user.sub, body);
  }

  @Post('payouts')
  @UseGuards(AgentTokenGuard)
  payout(@CurrentUser() user: AccessPayload, @Body() body: CreatePayoutDto) {
    return this.wallet.createPayout(user.sub, body);
  }

  @Get('payin/webhook')
  @Post('payin/webhook')
  payinWebhook(@Req() req: Request) {
    const source = (req.method === 'GET' ? req.query : req.body) as Record<string, unknown>;
    const input: PayinWebhookDto = {
      status: source?.status as PayinWebhookDto['status'],
      order_id: String(source?.order_id || source?.request_id || ''),
      amount: source?.amount as PayinWebhookDto['amount'],
      utr: source?.utr == null ? undefined : String(source.utr),
      status_text: source?.status_text == null ? undefined : String(source.status_text),
    };
    this.logger.log(`Payin callback ${input.order_id || 'missing'} ${input.status_text || input.status || ''}`);
    return this.wallet.payinWebhook(input);
  }

  @Post('payout/webhook')
  payoutWebhook(@Body() body: PayoutWebhookDto) {
    return this.wallet.payoutWebhook(body);
  }

  @Get('payin/open/:requestId')
  async payinOpen(@Param('requestId') requestId: string, @Res() res: Response) {
    const html = await this.wallet.payinOpenPage(requestId);
    res.type('html').send(html);
  }

  @Get('payin/return')
  payinReturn(@Res() res: Response) {
    res.type('html').send('<!doctype html><html><body style="font-family:sans-serif;padding:32px"><h1>Payment sent to Broget Pay</h1><p>Return to the Broget AI app and refresh the wallet.</p></body></html>');
  }
}
