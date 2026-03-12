import { NextRequest, NextResponse } from 'next/server';
import { getShadesByLineId, createColorShade } from '@/lib/queries/color';
import { createColorShadeSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lineId = searchParams.get('lineId');

    if (!lineId || isNaN(Number(lineId))) {
      return NextResponse.json({ error: 'lineId parameter required' }, { status: 400 });
    }

    const shades = getShadesByLineId(Number(lineId));
    return NextResponse.json(shades);
  } catch (error) {
    console.error('GET /api/color/shades error:', error);
    return NextResponse.json({ error: 'Failed to fetch shades' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const parsed = createColorShadeSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const id = createColorShade(
      parsed.data.color_line_id,
      parsed.data.shade_name,
      parsed.data.shade_code ?? null
    );
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error('POST /api/color/shades error:', error);
    return NextResponse.json({ error: 'Failed to create shade' }, { status: 500 });
  }
}
