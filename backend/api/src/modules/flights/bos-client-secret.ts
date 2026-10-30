import { createHash, createHmac } from 'crypto';

/** AO Pay / BOS client secret: SHA256(regId) base64 → HMAC-SHA256(regId) base64. */
export function generateBosClientSecret(registrationId: string) {
  const id = registrationId.trim();
  const secretKey = createHash('sha256').update(id, 'utf8').digest('base64');
  return createHmac('sha256', Buffer.from(secretKey, 'utf8')).update(id, 'utf8').digest('base64');
}
