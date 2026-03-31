import nodemailer from 'nodemailer';

/**
 * Send a decline notification email to a customer whose booking request was declined.
 * Fails silently -- the decline should still succeed even if email doesn't go through.
 */
export async function notifyCustomerDecline(opts: {
  toEmail: string;
  firstName: string;
  serviceNames: string;
  bookingDate: string;
}): Promise<void> {
  return sendDeclineEmail({
    toEmail: opts.toEmail,
    subject: 'About your appointment request at All Beauty Hair Studio',
    body: [
      `Hi ${opts.firstName},`,
      '',
      `Unfortunately, we are not able to accommodate your requested appointment for ${opts.serviceNames} on ${opts.bookingDate}.`,
      '',
      `We'd love to see you -- please visit our booking page to find another time that works.`,
      '',
      '-- Karli',
      'All Beauty Hair Studio',
    ].join('\n'),
  });
}

/**
 * Send a decline email to a client whose consultation form was reviewed and declined.
 * Warmer tone -- focuses on fit, not rejection. Offers referral help.
 * Fails silently -- the decline should still succeed even if email doesn't go through.
 */
export async function notifyConsultationDecline(opts: {
  toEmail: string;
  firstName: string;
  reason?: string;
}): Promise<void> {
  const lines = [
    `Hi ${opts.firstName},`,
    '',
    `Thank you so much for taking the time to fill out the consultation form -- I really appreciate you sharing all of that with me.`,
    '',
    `After reviewing everything, I don't think I'm the best fit for what you're looking for right now. I want to make sure you get the best possible experience, and I'd rather be honest than take you on and not deliver what you deserve.`,
  ];

  if (opts.reason) {
    lines.push('', opts.reason);
  }

  lines.push(
    '',
    `If you'd like, I'm happy to recommend another stylist who might be a better match for your needs -- just let me know!`,
    '',
    'Wishing you all the best,',
    'Karli',
    'All Beauty Hair Studio',
  );

  return sendDeclineEmail({
    toEmail: opts.toEmail,
    subject: 'Your consultation form at All Beauty Hair Studio',
    body: lines.join('\n'),
  });
}

async function sendDeclineEmail(opts: {
  toEmail: string;
  subject: string;
  body: string;
}): Promise<void> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || '587');
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn('Decline email skipped -- missing SMTP env vars');
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
      subject: opts.subject,
      text: opts.body,
    });
  } catch (error) {
    console.error('Decline email failed:', error);
  }
}
