import nodemailer from 'nodemailer';

/**
 * Send an email notification to Karli. Fails silently — intake/booking
 * operations should succeed even if the notification doesn't go through.
 */
export async function notifyEmail(subject: string, message: string): Promise<void> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || '587');
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn('Email notification skipped — missing SMTP env vars');
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
      from: `"ABHS Notifications" <${smtpUser}>`,
      to: smtpUser,
      subject,
      text: message,
    });
  } catch (error) {
    console.error('Email notification failed:', error);
  }
}
