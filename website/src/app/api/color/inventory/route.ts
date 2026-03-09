import { NextRequest, NextResponse } from 'next/server';
import { getInventory, upsertInventory } from '@/lib/queries/color';
import { updateInventorySchema } from '@/lib/validation';

export async function GET() {
  try {
    const inventory = getInventory();
    return NextResponse.json(inventory);
  } catch (error) {
    console.error('GET /api/color/inventory error:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const raw = await request.json();
    const parsed = updateInventorySchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const id = upsertInventory(parsed.data);
    return NextResponse.json({ id, success: true });
  } catch (error) {
    console.error('PUT /api/color/inventory error:', error);
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 });
  }
}
