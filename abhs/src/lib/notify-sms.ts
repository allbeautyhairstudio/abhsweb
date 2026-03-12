import nodemailer from 'nodemailer';

/**
 * Send an SMS via email-to-SMS gateway (AT&T: number@txt.att.net).
 * Uses SMTP credentials from env vars. Fails silently — intake should
 * succeed even if the notification doesn't go through.
 */
export async function notifySms(message: string): Promise<void> {
  const phone = process.env.NOTIFY_PHONE;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || '587');
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!phone || !smtpHost || !smtpUser || !smtpPass) {
    console.warn('SMS notification skipped — missing env vars (NOTIFY_PHONE, SMTP_HOST, SMTP_USER, SMTP_PASS)');
    return;
  }

  // AT&T SMS gateway
  const gateway = process.env.SMS_GATEWAY || 'txt.att.net';
  const to = `${phone}@${gateway}`;

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: smtpUser,
      to,
      subject: '',
      text: message.slice(0, 160), // SMS character limit
    });
  } catch (error) {
    // Log but don't throw — intake should still succeed
    console.error('SMS notification failed:', error);
  }
}
