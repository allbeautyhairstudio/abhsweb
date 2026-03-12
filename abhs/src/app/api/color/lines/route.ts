import { NextRequest, NextResponse } from 'next/server';
import { getColorLines, getColorBrands, createColorLine } from '@/lib/queries/color';
import { createColorLineSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brand = searchParams.get('brand') || undefined;
    const brandsOnly = searchParams.get('brands_only') === 'true';

    if (brandsOnly) {
      const brands = getColorBrands();
      return NextResponse.json(brands);
    }

    const lines = getColorLines(brand);
    return NextResponse.json(lines);
  } catch (error) {
    console.error('GET /api/color/lines error:', error);
    return NextResponse.json({ error: 'Failed to fetch color lines' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const parsed = createColorLineSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const id = createColorLine(parsed.data.brand_name, parsed.data.line_name);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error('POST /api/color/lines error:', error);
    return NextResponse.json({ error: 'Failed to create color line' }, { status: 500 });
  }
}
