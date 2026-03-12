import { NextRequest, NextResponse } from 'next/server';
import { getFormulaById, updateFormula, deleteFormula } from '@/lib/queries/color';
import { updateFormulaSchema } from '@/lib/validation';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formulaId = Number(id);
    if (isNaN(formulaId)) {
      return NextResponse.json({ error: 'Invalid formula ID' }, { status: 400 });
    }

    const formula = getFormulaById(formulaId);
    if (!formula) {
      return NextResponse.json({ error: 'Formula not found' }, { status: 404 });
    }

    return NextResponse.json(formula);
  } catch (error) {
    console.error('GET /api/color/formulas/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch formula' }, { status: 500 });
  }
}

export async function PUT(
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
    const parsed = updateFormulaSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = updateFormula(formulaId, parsed.data);
    if (!updated) {
      return NextResponse.json({ error: 'Formula not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/color/formulas/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update formula' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formulaId = Number(id);
    if (isNaN(formulaId)) {
      return NextResponse.json({ error: 'Invalid formula ID' }, { status: 400 });
    }

    const deleted = deleteFormula(formulaId);
    if (!deleted) {
      return NextResponse.json({ error: 'Formula not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/color/formulas/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete formula' }, { status: 500 });
  }
}
