#!/usr/bin/env node
/**
 * AO Pay / BOS onboarding helper. Run ON THE SERVER that will call the AO Pay API:
 *
 *   node scripts/aopay-credentials.js AOP-1009            # print Client Secret + Public Key (creates a key pair if missing)
 *   node scripts/aopay-credentials.js AOP-1009 --new-key  # force a fresh RSA key pair
 *
 * Client Secret (https://readapi.aopay.co.in/Authorization.aspx):
 *   HMAC-SHA256( key = UTF8( Base64( SHA256(RegistrationID) ) ), message = RegistrationID ) -> Base64
 *
 * Public Key: RSA-2048, PEM (SPKI). The private key stays on this server only (keys/aopay-private.pem);
 * send AO Pay the public key. Copy both into .env as AOPAY_PUBLIC_KEY / AOPAY_PRIVATE_KEY if you keep them there.
 */
const { createHash, createHmac, generateKeyPairSync, createPrivateKey, createPublicKey } = require('crypto');
const { existsSync, mkdirSync, readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const registrationId = (process.argv[2] || '').trim();
if (!/^AOP-\d+$/i.test(registrationId)) {
  console.error('Usage: node scripts/aopay-credentials.js <RegistrationID e.g. AOP-1009> [--new-key]');
  process.exit(1);
}

const secretKey = createHash('sha256').update(registrationId, 'utf8').digest('base64');
const clientSecret = createHmac('sha256', Buffer.from(secretKey, 'utf8')).update(registrationId, 'utf8').digest('base64');

const dir = join(__dirname, '..', 'keys');
const privatePath = join(dir, 'aopay-private.pem');
const publicPath = join(dir, 'aopay-public.pem');
if (process.argv.includes('--new-key') || !existsSync(privatePath)) {
  mkdirSync(dir, { recursive: true });
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  writeFileSync(privatePath, privateKey, { mode: 0o600 });
  writeFileSync(publicPath, publicKey);
}
const publicKey = createPublicKey(createPrivateKey(readFileSync(privatePath, 'utf8'))).export({ type: 'spki', format: 'pem' }).toString();

console.log(`Registration ID : ${registrationId}`);
console.log(`Client Secret   : ${clientSecret}`);
console.log('Public Key      :');
console.log(publicKey.trim());
console.log(`\n(private key kept at ${privatePath} - never share it)`);
