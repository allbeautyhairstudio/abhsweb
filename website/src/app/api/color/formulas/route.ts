import { NextRequest, NextResponse } from 'next/server';
import { getFormulasByClientId, createFormula } from '@/lib/queries/color';
import { createFormulaSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId || isNaN(Number(clientId))) {
      return NextResponse.json({ error: 'clientId parameter required' }, { status: 400 });
    }

    const formulas = getFormulasByClientId(Number(clientId));
    return NextResponse.json(formulas);
  } catch (error) {
    console.error('GET /api/color/formulas error:', error);
    return NextResponse.json({ error: 'Failed to fetch formulas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const parsed = createFormulaSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const id = createFormula(parsed.data);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error('POST /api/color/formulas error:', error);
    return NextResponse.json({ error: 'Failed to create formula' }, { status: 500 });
  }
}
