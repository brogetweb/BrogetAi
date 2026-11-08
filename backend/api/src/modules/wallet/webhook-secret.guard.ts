import { CanActivate, ExecutionContext, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, timingSafeEqual } from 'crypto';
import type { Request } from 'express';

const digest = (value: string) => createHash('sha256').update(value).digest();

/**
 * Broget Pay publishes no webhook signature, so the callback URL itself carries a secret
 * known only to this server and Broget Pay. Without BROGETPAY_WEBHOOK_SECRET every callback
 * is refused: a payment is never confirmed by an unauthenticated request.
 */
@Injectable()
export class WebhookSecretGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext) {
    const expected = this.config.get<string>('BROGETPAY_WEBHOOK_SECRET')?.trim();
    const supplied = context.switchToHttp().getRequest<Request>().params?.secret;
    if (!expected || typeof supplied !== 'string' || !timingSafeEqual(digest(expected), digest(supplied))) {
      throw new NotFoundException();
    }
    return true;
  }
}
