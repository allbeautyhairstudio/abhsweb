import { NextRequest, NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { isAuthenticated } from '@/lib/admin-auth';

type RouteParams = { params: Promise<{ clientId: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId } = await params;

    if (!/^\d+$/.test(clientId)) {
      return NextResponse.json({ error: 'Invalid clientId' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'data', 'uploads', clientId);

    if (!existsSync(uploadDir)) {
      return NextResponse.json({ photos: [] });
    }

    const files = await readdir(uploadDir);
    const imageFiles = files.filter((f) =>
      /\.(jpg|jpeg|png|webp|heic)$/i.test(f)
    );

    const photos = imageFiles.map((filename) => ({
      filename,
      type: filename.startsWith('selfie') ? 'selfie' : filename.startsWith('inspo') ? 'inspiration' : 'other',
      url: `/api/admin/uploads/${clientId}/${filename}`,
    }));

    return NextResponse.json({ photos });
  } catch (error) {
    console.error('Photo list error:', error);
    return NextResponse.json({ error: 'Failed to list photos.' }, { status: 500 });
  }
}
