import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { isAuthenticated } from '@/lib/admin-auth';
import { getClientById } from '@/lib/queries/clients';
import { getIntakeNote } from '@/lib/queries/intake-queue';
import { getNotesByClientId, getStylistNote } from '@/lib/queries/notes';
import { getChatMessages, createChatMessage } from '@/lib/queries/chat';
import { parseSalonIntakeNote, assessSalonIntake } from '@/lib/salon-summary';
import { buildSystemPrompt, buildChatMessages } from '@/lib/chat-context';
import { CHAT_MODEL, CHAT_MAX_MESSAGE_LENGTH, CHAT_HISTORY_WINDOW } from '@/lib/constants/chat-system-prompt';
import { z } from 'zod';

const ChatRequestSchema = z.object({
  clientId: z.number().int().positive(),
  message: z.string().min(1).max(CHAT_MAX_MESSAGE_LENGTH),
  channelContext: z.enum(['sms', 'email', 'both']).nullable().optional(),
});

/**
 * GET /api/admin/chat?clientId=N
 * Load chat history for a client.
 */
export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clientId = Number(request.nextUrl.searchParams.get('clientId'));
  if (!clientId || isNaN(clientId)) {
    return NextResponse.json({ error: 'Invalid clientId' }, { status: 400 });
  }

  const messages = getChatMessages(clientId);
  return NextResponse.json({ messages });
}

/**
 * POST /api/admin/chat
 * Send a message and stream Claude's response.
 */
export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'AI assistant unavailable' }, { status: 500 });
  }

  // Parse and validate request body
  let body;
  try {
    body = ChatRequestSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { clientId, message, channelContext } = body;

  // Load client data
  const client = getClientById(clientId);
  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  // Load intake note and parse
  const noteContent = getIntakeNote(clientId);
  if (!noteContent) {
    return NextResponse.json({ error: 'No intake data for this client' }, { status: 404 });
  }

  const intake = parseSalonIntakeNote(noteContent);
  const summary = assessSalonIntake(intake, false);

  // Build intake context object
  const intakeContext = {
    clientName: client.q02_client_name || 'Unknown',
    email: client.q03_email || '',
    phone: client.phone || intake.phone,
    pronouns: intake.pronouns,
    preferredContact: client.preferred_contact,
    hairLoveHate: intake.hairLoveHate,
    serviceInterest: intake.serviceInterest,
    hairTexture: intake.hairTexture,
    hairLength: intake.hairLength,
    hairDensity: intake.hairDensity,
    hairCondition: intake.hairCondition,
    stylingDescription: intake.stylingDescription,
    dailyRoutine: intake.dailyRoutine,
    hairHistory: intake.hairHistory,
    colorReaction: intake.colorReaction,
    shampooFrequency: intake.shampooFrequency,
    whatTheyWant: intake.whatTheyWant,
    maintenanceFrequency: intake.maintenanceFrequency,
    availability: intake.availability,
    medicalInfo: intake.medicalInfo,
    referralSource: client.referral_source,
    products: intake.products,
  };

  // Load client notes and stylist assessment
  const clientNotes = getNotesByClientId(clientId);
  const stylistNotes = getStylistNote(clientId);

  // Load chat history
  const chatHistory = getChatMessages(clientId, CHAT_HISTORY_WINDOW);

  // Save user message
  createChatMessage(clientId, 'user', message, channelContext ?? null);

  // Map SalonSummary scores to plain numbers for context builder
  const summaryContext = {
    overallRating: summary.overallRating,
    readinessScore: summary.readiness.score,
    complexityScore: summary.complexity.score,
    engagementScore: summary.engagement.score,
    flags: summary.flags,
    highlights: summary.highlights,
  };

  // Build messages for Claude
  const systemPrompt = buildSystemPrompt(intakeContext, summaryContext, clientNotes, channelContext, stylistNotes);
  const messages = buildChatMessages(chatHistory, message);

  // Stream response
  try {
    const anthropic = new Anthropic({ apiKey });

    const stream = await anthropic.messages.stream({
      model: CHAT_MODEL,
      max_tokens: 1500,
      system: systemPrompt,
      messages,
    });

    let fullResponse = '';

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              const text = event.delta.text;
              fullResponse += text;
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }

          // Save assistant response to DB
          createChatMessage(clientId, 'assistant', fullResponse, channelContext ?? null);

          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ done: true })}\n\n`));
          controller.close();
        } catch (error) {
          console.error('Chat stream error:', error);

          // Save partial response if we have one
          if (fullResponse) {
            createChatMessage(clientId, 'assistant', fullResponse + '\n\n[Response interrupted]', channelContext ?? null);
          }

          controller.enqueue(new TextEncoder().encode(
            `data: ${JSON.stringify({ error: 'Response interrupted -- try again' })}\n\n`
          ));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Something went wrong, try again' }, { status: 500 });
  }
}
