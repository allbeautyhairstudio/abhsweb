import { NextRequest, NextResponse } from 'next/server';
import { getClientById } from '@/lib/queries/clients';
import { getPromptsByClientId, upsertGeneratedPrompt, saveAiOutput, getChainOutputs } from '@/lib/queries/prompts';
import { populateAllPrompts } from '@/lib/prompts/auto-populate';
import { PROMPT_TEMPLATES } from '@/lib/constants/prompt-templates';
import { saveAiOutputSchema } from '@/lib/validation';
import { escapeHtml } from '@/lib/sanitize';

/** GET: Generate and return all prompts for a client. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Get stored chain outputs (AI responses from previous prompts)
    const chainOutputs = getChainOutputs(numId);

    // Populate all prompts from templates + client data
    const populated = populateAllPrompts(client as unknown as Record<string, unknown>, chainOutputs);

    // Persist to generated_prompts table (upsert)
    for (const p of populated) {
      upsertGeneratedPrompt(numId, p.prompt_code, p.populated_prompt);
    }

    // Get stored data (includes ai_output)
    const stored = getPromptsByClientId(numId);

    // Merge populated data with stored ai_output
    const result = populated.map(p => {
      const saved = stored.find(s => s.prompt_code === p.prompt_code);
      return {
        ...p,
        ai_output: saved?.ai_output ?? null,
        generated_at: saved?.generated_at ?? null,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/clients/[id]/prompts error:', error);
    return NextResponse.json({ error: 'Failed to generate prompts' }, { status: 500 });
  }
}

/** POST: Save AI output for a specific prompt (paste-back). */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = Number(id);
    if (isNaN(numId) || numId < 1) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    const raw = await request.json();
    const parsed = saveAiOutputSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    // Validate prompt_code exists in templates
    const template = PROMPT_TEMPLATES.find(t => t.code === parsed.data.prompt_code);
    if (!template) {
      return NextResponse.json({ error: 'Invalid prompt code' }, { status: 400 });
    }

    const sanitized = escapeHtml(parsed.data.ai_output);
    saveAiOutput(numId, parsed.data.prompt_code, sanitized);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/clients/[id]/prompts error:', error);
    return NextResponse.json({ error: 'Failed to save AI output' }, { status: 500 });
  }
}
