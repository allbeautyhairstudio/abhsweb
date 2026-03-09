import { NextRequest, NextResponse } from 'next/server';
import { intakeFormSchema } from '@/lib/intake-validation';
import { sanitizeString } from '@/lib/sanitize';
import { getDb } from '@/lib/db';
import { notifySms } from '@/lib/notify-sms';

/**
 * Rate limiting — simple in-memory tracker.
 * 3 submissions per IP per hour (more restrictive than contact form).
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  // Skip rate limiting for local development
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost' || ip === '::ffff:127.0.0.1') {
    return false;
  }

  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return false;
  }

  if (entry.count >= 3) return true;

  entry.count++;
  return false;
}

/** Human-readable label for option values */
function formatLabel(val: string): string {
  return val.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate
    const body = await request.json();
    const parsed = intakeFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid form data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Sanitize text inputs
    const firstName = sanitizeString(data.first_name);
    const lastName = sanitizeString(data.last_name);
    const fullName = `${firstName} ${lastName}`;
    const email = sanitizeString(data.email);
    const phone = sanitizeString(data.phone);
    const pronouns = data.pronouns ? sanitizeString(data.pronouns) : null;
    const referralSource = data.referral_source ? sanitizeString(data.referral_source) : null;

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Required fields are missing.' },
        { status: 400 }
      );
    }

    // Build detailed intake note
    const intakeDetails = [
      `--- NEW CLIENT INTAKE FORM ---`,
      `Submitted: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
      ``,
      `--- ABOUT ---`,
      `Name: ${fullName}`,
      pronouns ? `Pronouns: ${pronouns}` : null,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Preferred Contact: ${formatLabel(data.preferred_contact)}`,
      ``,
      `--- HAIR PROFILE ---`,
      `Service Interest: ${formatLabel(data.service_interest)}`,
      data.hair_love_hate ? `Love/Hate: ${sanitizeString(data.hair_love_hate)}` : null,
      `Texture: ${formatLabel(data.hair_texture)}`,
      `Length: ${formatLabel(data.hair_length)}`,
      `Density: ${formatLabel(data.hair_density)}`,
      `Condition: ${data.hair_condition.map(formatLabel).join(', ')}`,
      ``,
      `--- PERSONALITY & ROUTINE ---`,
      `Self-Description: ${formatLabel(data.styling_description)}`,
      `Daily Routine: ${formatLabel(data.daily_routine)}`,
      `Shampoo Frequency: ${formatLabel(data.shampoo_frequency)}`,
      ``,
      `--- HAIR HISTORY (LAST 2 YEARS) ---`,
      `Treatments: ${data.hair_history.map(formatLabel).join(', ')}`,
      `Color Reaction: ${formatLabel(data.color_reaction)}`,
      data.current_products ? `Current Products: ${sanitizeString(data.current_products)}` : null,
      ``,
      `--- GOALS & SCHEDULE ---`,
      `What They Want: ${sanitizeString(data.what_you_want)}`,
      `Maintenance Frequency: ${formatLabel(data.maintenance_frequency)}`,
      `Availability: ${data.availability.map(formatLabel).join(', ')}`,
      ``,
      `--- ADDITIONAL ---`,
      data.medical_info ? `Medical/Allergy Info: ${sanitizeString(data.medical_info)}` : `Medical/Allergy Info: None provided`,
      `Referral Source: ${referralSource || 'Not specified'}`,
    ]
      .filter((line) => line !== null)
      .join('\n');

    // Insert into CRM database
    const db = getDb();
    const today = new Date().toISOString().slice(0, 10);

    // Create client record with intake_submitted status — salon business type
    const insertClient = db.prepare(`
      INSERT INTO clients (
        business_type, q02_client_name, q03_email, phone, preferred_contact,
        status, inquiry_date, referral_source,
        consent_terms_accepted, consent_date,
        created_at, updated_at
      ) VALUES ('salon', ?, ?, ?, ?, 'intake_submitted', ?, ?, 1, ?, datetime('now'), datetime('now'))
    `);

    const result = insertClient.run(fullName, email, phone, data.preferred_contact, today, referralSource, today);
    const clientId = result.lastInsertRowid;

    // Create comprehensive intake note
    const insertNote = db.prepare(`
      INSERT INTO client_notes (client_id, note_type, content, created_at)
      VALUES (?, 'interest_flag', ?, datetime('now'))
    `);

    insertNote.run(clientId, intakeDetails);

    // Send SMS notification (fire-and-forget — don't block response)
    const smsMessage = `New client: ${fullName}${data.service_interest ? ` (${formatLabel(data.service_interest)})` : ''}. Check admin dashboard.`;
    notifySms(smsMessage).catch(() => {});

    return NextResponse.json(
      { success: true, clientId: Number(clientId), message: 'Intake form received.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Intake form error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
