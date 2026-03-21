import nodemailer from 'nodemailer';

/**
 * Build a branded HTML email that matches the ABHS aesthetic.
 * Warm copper/sage/cream palette, clean typography, Karli's voice.
 */
function buildHtmlEmail(opts: {
  headline: string;
  sections: { label: string; value: string }[];
  actionUrl?: string;
  actionLabel?: string;
}): string {
  const sectionRows = opts.sections
    .map(
      (s) => `
      <tr>
        <td style="padding: 6px 0; color: #92785c; font-size: 13px; font-weight: 600; vertical-align: top; width: 140px;">
          ${s.label}
        </td>
        <td style="padding: 6px 0; color: #5c4a3a; font-size: 14px; vertical-align: top;">
          ${s.value}
        </td>
      </tr>`
    )
    .join('');

  const actionButton = opts.actionUrl
    ? `
      <tr>
        <td colspan="2" style="padding: 24px 0 0 0;">
          <a href="${opts.actionUrl}" style="display: inline-block; background-color: #4a7c59; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 600;">
            ${opts.actionLabel || 'View in Dashboard'}
          </a>
        </td>
      </tr>`
    : '';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin: 0; padding: 0; background-color: #faf7f2; font-family: Georgia, 'Times New Roman', serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #faf7f2; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #4a7c59 0%, #5a8f69 100%); padding: 28px 32px; text-align: center;">
              <p style="margin: 0; color: #d4c5a9; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">All Beauty Hair Studio</p>
              <h1 style="margin: 8px 0 0 0; color: #ffffff; font-size: 22px; font-weight: 400;">
                ${opts.headline}
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 28px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${sectionRows}
                ${actionButton}
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #faf7f2; border-top: 1px solid #e8e0d4; text-align: center;">
              <p style="margin: 0; color: #a09080; font-size: 11px;">
                All Beauty Hair Studio -- Wildomar, CA
              </p>
              <p style="margin: 4px 0 0 0; color: #a09080; font-size: 11px;">
                This is an automated notification from your salon dashboard.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Send a branded HTML email notification to Karli. Fails silently --
 * intake/booking operations should succeed even if the notification doesn't go through.
 */
export async function notifyEmail(
  subject: string,
  message: string,
  html?: { headline: string; sections: { label: string; value: string }[]; actionUrl?: string; actionLabel?: string }
): Promise<void> {
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
      from: `"All Beauty Hair Studio" <${smtpUser}>`,
      to: smtpUser,
      subject,
      text: message,
      ...(html ? { html: buildHtmlEmail(html) } : {}),
    });
  } catch (error) {
    console.error('Email notification failed:', error);
  }
}
