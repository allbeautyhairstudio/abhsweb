import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { getClientById, updateClient } from '@/lib/queries/clients';
import { getIntakeNote } from '@/lib/queries/intake-queue';
import { parseSalonIntakeNote, assessSalonIntake } from '@/lib/salon-summary';
import { salonSummaryActionSchema } from '@/lib/validation';
import { linkBookingRequestsByEmail } from '@/lib/booking-requests';
import { notifyConsultationDecline, notifyNotAFitDecline } from '@/lib/notify-decline';
import fs from 'fs';
import path from 'path';

/**
 * GET /api/admin/salon/summary/[id]
 * Compute and return the salon AI summary for a client.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const numId = Number(id);
    if (isNaN(numId) || numId < 1) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    const client = getClientById(numId);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }


    // Get the intake note
    const noteContent = getIntakeNote(numId);
    if (!noteContent) {
      return NextResponse.json({ error: 'No intake note found' }, { status: 404 });
    }

    // Check for photos
    const uploadDir = path.join(process.cwd(), 'data', 'uploads', String(numId));
    const hasPhotos = fs.existsSync(uploadDir) && fs.readdirSync(uploadDir).length > 0;

    // Compute summary
    const intake = parseSalonIntakeNote(noteContent);
    const summary = assessSalonIntake(intake, hasPhotos);

    return NextResponse.json({ summary, intake, noteContent });
  } catch (error) {
    console.error('GET /api/admin/salon/summary/[id] error:', error);
    return NextResponse.json({ error: 'Failed to compute summary' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/salon/summary/[id]
 * Accept or decline a salon intake submission.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const numId = Number(id);
    if (isNaN(numId) || numId < 1) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    const client = getClientById(numId);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }


    const raw = await request.json();
    const parsed = salonSummaryActionSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { action, decline_type, decline_reason } = parsed.data;

    if (action === 'accept') {
      // Compute summary to determine fit rating
      const noteContent = getIntakeNote(numId);
      let fitRating: 'green' | 'yellow' = 'green';
      if (noteContent) {
        const intake = parseSalonIntakeNote(noteContent);
        const summary = assessSalonIntake(intake);
        fitRating = summary.overallRating === 'red' ? 'yellow' : summary.overallRating as 'green' | 'yellow';
      }

      // Move to active_client
      updateClient(numId, {
        status: 'active_client',
        fit_rating: fitRating,
        intake_date: new Date().toISOString().slice(0, 10),
      });

      // Link any matching booking requests by email
      const email = client.q03_email;
      let linkedBookings = 0;
      if (email) {
        linkedBookings = linkBookingRequestsByEmail(numId, email);
      }

      return NextResponse.json({
        success: true,
        action: 'accepted',
        status: 'active_client',
        fitRating,
        linkedBookings,
      });
    } else {
      // Decline
      updateClient(numId, {
        status: 'declined',
        fit_rating: 'red',
      });

      // Send decline email (fire-and-forget)
      if (client.q03_email && client.q02_client_name) {
        const emailOpts = {
          toEmail: client.q03_email,
          firstName: client.q02_client_name.split(' ')[0],
          reason: decline_reason || undefined,
        };
        if (decline_type === 'not_a_fit') {
          notifyNotAFitDecline(emailOpts).catch(() => {});
        } else {
          notifyConsultationDecline(emailOpts).catch(() => {});
        }
      }

      return NextResponse.json({
        success: true,
        action: 'declined',
        status: 'declined',
      });
    }
  } catch (error) {
    console.error('PUT /api/admin/salon/summary/[id] error:', error);
    return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
  }
}
