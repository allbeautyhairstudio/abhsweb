import { NextRequest, NextResponse } from 'next/server';
import { intakeFormSchema } from '@/lib/intake-validation';
import { sanitizeString } from '@/lib/sanitize';
import { getDb } from '@/lib/db';
import { notifySms } from '@/lib/notify-sms';
import { notifyEmail } from '@/lib/notify-email';

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

    // Duplicate detection -- reject if same email submitted within last 5 minutes
    const db = getDb();
    const recentDuplicate = db.prepare(`
      SELECT id FROM clients
      WHERE q03_email = ? AND status = 'intake_submitted'
        AND created_at > datetime('now', '-5 minutes')
      LIMIT 1
    `).get(email) as { id: number } | undefined;

    if (recentDuplicate) {
      return NextResponse.json(
        { success: true, clientId: recentDuplicate.id, message: 'Consultation form received.' },
        { status: 201 }
      );
    }

    // Build product fields from individual inputs
    const productFields = [
      { label: 'Shampoo', value: data.product_shampoo },
      { label: 'Conditioner', value: data.product_conditioner },
      { label: 'Hair Spray', value: data.product_hair_spray },
      { label: 'Dry Shampoo', value: data.product_dry_shampoo },
      { label: 'Heat Protector', value: data.product_heat_protector },
      { label: 'Other', value: data.product_other },
    ].filter(p => p.value);

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
      `Preferred Contact: ${data.preferred_contact.map(formatLabel).join(', ')}`,
      ``,
      `--- HAIR PROFILE ---`,
      `Service Interest: ${data.service_interest.map(formatLabel).join(', ')}`,
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
      `Color Reaction: ${data.color_reaction.map(formatLabel).join(', ')}`,
      productFields.length > 0 ? `\n--- PRODUCTS ---\n${productFields.map(p => `${p.label}: ${sanitizeString(p.value!)}`).join('\n')}` : null,
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

    const result = insertClient.run(fullName, email, phone, data.preferred_contact.join(','), today, referralSource, today);
    const clientId = result.lastInsertRowid;

    // Create comprehensive intake note
    const insertNote = db.prepare(`
      INSERT INTO client_notes (client_id, note_type, content, created_at)
      VALUES (?, 'interest_flag', ?, datetime('now'))
    `);

    insertNote.run(clientId, intakeDetails);

    // Send notifications (fire-and-forget — don't block response)
    const smsMsg = `New client: ${fullName} (${data.service_interest.map(formatLabel).join(', ')}). Check admin dashboard.`;
    notifySms(smsMsg).catch(() => {});

    const siteUrl = process.env.SITE_URL || 'https://allbeautyhairstudio.com';
    const emailBody = [
      `New Client Consultation Submission`,
      ``,
      intakeDetails,
      ``,
      `---`,
      `Review this submission:`,
      `${siteUrl}/admin/intake/${clientId}`,
    ].join('\n');

    const htmlSections: { label: string; value: string }[] = [];
    htmlSections.push({ label: 'Name', value: fullName });
    if (pronouns) htmlSections.push({ label: 'Pronouns', value: pronouns });
    htmlSections.push({ label: 'Email', value: email || '' });
    htmlSections.push({ label: 'Phone', value: phone || '' });
    htmlSections.push({ label: 'Preferred Contact', value: data.preferred_contact.map(formatLabel).join(', ') });
    htmlSections.push({ label: 'Service Interest', value: data.service_interest.map(formatLabel).join(', ') });
    if (data.hair_love_hate) htmlSections.push({ label: 'Love/Hate', value: sanitizeString(data.hair_love_hate) || '' });
    htmlSections.push({ label: 'Texture', value: formatLabel(data.hair_texture) });
    htmlSections.push({ label: 'Length', value: formatLabel(data.hair_length) });
    htmlSections.push({ label: 'Density', value: formatLabel(data.hair_density) });
    htmlSections.push({ label: 'Condition', value: data.hair_condition.map(formatLabel).join(', ') });
    htmlSections.push({ label: 'Self-Description', value: formatLabel(data.styling_description) });
    htmlSections.push({ label: 'Daily Routine', value: formatLabel(data.daily_routine) });
    htmlSections.push({ label: 'Shampoo Frequency', value: formatLabel(data.shampoo_frequency) });
    htmlSections.push({ label: 'Hair History', value: data.hair_history.map(formatLabel).join(', ') });
    htmlSections.push({ label: 'Color Reaction', value: data.color_reaction.map(formatLabel).join(', ') });
    if (productFields.length > 0) htmlSections.push({ label: 'Products', value: productFields.map(p => `${p.label}: ${sanitizeString(p.value!)}`).join(', ') });
    htmlSections.push({ label: 'What They Want', value: sanitizeString(data.what_you_want) || '' });
    htmlSections.push({ label: 'Maintenance', value: formatLabel(data.maintenance_frequency) });
    htmlSections.push({ label: 'Availability', value: data.availability.map(formatLabel).join(', ') });
    if (data.medical_info) htmlSections.push({ label: 'Medical/Allergy', value: sanitizeString(data.medical_info) || '' });
    htmlSections.push({ label: 'Referral', value: referralSource || 'Not specified' });

    notifyEmail(`New Client Consultation: ${fullName}`, emailBody, {
      headline: `New Client: ${fullName}`,
      sections: htmlSections,
      actionUrl: `${siteUrl}/admin/intake/${clientId}`,
      actionLabel: 'Review Consultation',
    }).catch(() => {});

    return NextResponse.json(
      { success: true, clientId: Number(clientId), message: 'Consultation form received.' },
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
