import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { AccessTokenGuard } from '../auth/access-token.guard';
import { AgentTokenGuard } from '../auth/agent-token.guard';
import { AccessPayload } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreatePayoutDto, CreateTopupDto, PayinWebhookDto, PayoutWebhookDto } from './dto/wallet.dto';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
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

  @Post('payin/webhook')
  payinWebhook(@Body() body: PayinWebhookDto) {
    return this.wallet.payinWebhook(body);
  }

  @Post('payout/webhook')
  payoutWebhook(@Body() body: PayoutWebhookDto) {
    return this.wallet.payoutWebhook(body);
  }

  @Get('payin/return')
  payinReturn(@Res() res: Response) {
    res.type('html').send('<!doctype html><html><body style="font-family:sans-serif;padding:32px"><h1>Payment sent to Broget Pay</h1><p>Return to the Broget AI app and refresh the wallet.</p></body></html>');
  }
}
