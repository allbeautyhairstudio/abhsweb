import { NextRequest, NextResponse } from 'next/server';
import { duplicateFormula } from '@/lib/queries/color';
import { z } from 'zod';

const duplicateSchema = z.object({
  service_date: z.string().min(1, 'Service date required').max(20),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formulaId = Number(id);
    if (isNaN(formulaId)) {
      return NextResponse.json({ error: 'Invalid formula ID' }, { status: 400 });
    }

    const raw = await request.json();
    const parsed = duplicateSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const newId = duplicateFormula(formulaId, parsed.data.service_date);
    if (newId === null) {
      return NextResponse.json({ error: 'Original formula not found' }, { status: 404 });
    }

    return NextResponse.json({ id: newId }, { status: 201 });
  } catch (error) {
    console.error('POST /api/color/formulas/[id]/duplicate error:', error);
    return NextResponse.json({ error: 'Failed to duplicate formula' }, { status: 500 });
  }
}
