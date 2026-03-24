import twilio from 'twilio';
import { readFileSync } from 'fs';

// Parse .env.local
const envFile = readFileSync('.env.local', 'utf-8');
const env = {};
for (const line of envFile.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
}

const accountSid = env.TWILIO_ACCOUNT_SID;
const authToken = env.TWILIO_AUTH_TOKEN;
const fromNumber = env.TWILIO_PHONE_NUMBER;
const toNumber = env.NOTIFY_PHONE;

console.log('Twilio Test Config:');
console.log(`  Account SID: ${accountSid}`);
console.log(`  Auth Token: ***set***`);
console.log(`  From: ${fromNumber}`);
console.log(`  To: ${toNumber}`);
console.log('');

const client = twilio(accountSid, authToken);

console.log('Sending test SMS...');

try {
  const msg = await client.messages.create({
    body: 'ABHS test: Twilio SMS notifications are working!',
    from: fromNumber,
    to: toNumber,
  });
  console.log('SUCCESS!');
  console.log(`  SID: ${msg.sid}`);
  console.log(`  Status: ${msg.status}`);
} catch (error) {
  console.error('FAILED:', error.message);
}
