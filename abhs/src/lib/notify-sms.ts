import twilio from 'twilio';

/**
 * Send an SMS via Twilio. Fails silently — intake/booking operations
 * should succeed even if the notification doesn't go through.
 */
export async function notifySms(message: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  const toNumber = process.env.NOTIFY_PHONE;

  if (!accountSid || !authToken || !fromNumber || !toNumber) {
    console.warn('SMS notification skipped — missing env vars (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, NOTIFY_PHONE)');
    return;
  }

  try {
    const client = twilio(accountSid, authToken);
    await client.messages.create({
      body: message,
      from: fromNumber,
      to: toNumber,
    });
  } catch (error) {
    // Log but don't throw — intake should still succeed
    console.error('SMS notification failed:', error);
  }
}
