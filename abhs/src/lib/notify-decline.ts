import nodemailer from 'nodemailer';

/**
 * Send a decline notification email to a customer whose booking request was declined.
 * Uses the same SMTP configuration as notify-sms.
 * Fails silently — the decline should still succeed even if email doesn't go through.
 */
export async function notifyCustomerDecline(opts: {
  toEmail: string;
  firstName: string;
  serviceNames: string;
  bookingDate: string;
}): Promise<void> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || '587');
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn('Decline email skipped — missing SMTP env vars');
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: `"All Beauty Hair Studio" <${smtpUser}>`,
      to: opts.toEmail,
      subject: 'About your appointment request at All Beauty Hair Studio',
      text: [
        `Hi ${opts.firstName},`,
        '',
        `Unfortunately, we are not able to accommodate your requested appointment for ${opts.serviceNames} on ${opts.bookingDate}.`,
        '',
        `We'd love to see you — please visit our booking page to find another time that works.`,
        '',
        '— Karli',
        'All Beauty Hair Studio',
      ].join('\n'),
    });
  } catch (error) {
    console.error('Decline email failed:', error);
  }
}
