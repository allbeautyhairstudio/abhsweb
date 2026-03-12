import { NextResponse } from 'next/server';
import { getLowStockAlerts } from '@/lib/queries/color';

export async function GET() {
  try {
    const alerts = getLowStockAlerts();
    return NextResponse.json(alerts);
  } catch (error) {
    console.error('GET /api/color/inventory/alerts error:', error);
    return NextResponse.json({ error: 'Failed to fetch low stock alerts' }, { status: 500 });
  }
}
