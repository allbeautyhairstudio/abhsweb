import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';

// Parse .env.local manually to handle spaces in values
const envFile = readFileSync('.env.local', 'utf-8');
const env: Record<string, string> = {};
for (const line of envFile.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
}

const phone = env.NOTIFY_PHONE;
const gateway = env.SMS_GATEWAY || 'txt.att.net';
const smtpHost = env.SMTP_HOST;
const smtpPort = Number(env.SMTP_PORT || '587');
const smtpUser = env.SMTP_USER;
const smtpPass = env.SMTP_PASS;

console.log('SMS Test Config:');
console.log(`  Phone: ${phone}`);
console.log(`  Gateway: ${gateway}`);
console.log(`  SMTP Host: ${smtpHost}:${smtpPort}`);
console.log(`  SMTP User: ${smtpUser}`);
console.log(`  SMTP Pass: ${smtpPass ? '***set***' : 'MISSING'}`);
console.log(`  To: ${phone}@${gateway}`);
console.log('');

if (!phone || !smtpHost || !smtpUser || !smtpPass) {
  console.error('Missing env vars. Cannot send.');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: { user: smtpUser, pass: smtpPass },
});

console.log('Sending test SMS...');

try {
  const info = await transporter.sendMail({
    from: smtpUser,
    to: `${phone}@${gateway}`,
    subject: '',
    text: 'ABHS test: SMS notifications are working!',
  });
  console.log('SUCCESS! Message sent.');
  console.log(`  Message ID: ${info.messageId}`);
  console.log(`  Response: ${info.response}`);
} catch (error) {
  console.error('FAILED:', error);
}
