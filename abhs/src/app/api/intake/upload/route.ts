import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_TOTAL_FILES = 6;

/** Upload directory relative to the website project root */
function getUploadDir(clientId: string): string {
  return path.join(process.cwd(), 'data', 'uploads', clientId);
}

export async function POST(request: NextRequest) {
  try {
    const clientId = request.nextUrl.searchParams.get('clientId');

    if (!clientId || !/^\d+$/.test(clientId)) {
      return NextResponse.json(
        { error: 'Valid clientId is required.' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const selfies = formData.getAll('selfies') as File[];
    const inspiration = formData.getAll('inspiration') as File[];
    const allFiles = [...selfies, ...inspiration];

    if (allFiles.length === 0) {
      return NextResponse.json(
        { error: 'No files provided.' },
        { status: 400 }
      );
    }

    if (allFiles.length > MAX_TOTAL_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_TOTAL_FILES} files allowed.` },
        { status: 400 }
      );
    }

    // Validate all files before writing any
    for (const file of allFiles) {
      const isHeic = file.name.toLowerCase().endsWith('.heic');
      if (!ALLOWED_TYPES.includes(file.type) && !isHeic) {
        return NextResponse.json(
          { error: `${file.name}: only JPG, PNG, WebP, and HEIC files are allowed.` },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `${file.name}: file must be under 10MB.` },
          { status: 400 }
        );
      }
    }

    // Create upload directory
    const uploadDir = getUploadDir(clientId);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Write files with safe names
    const saved: string[] = [];

    for (let i = 0; i < selfies.length; i++) {
      const file = selfies[i];
      const ext = path.extname(file.name).toLowerCase() || '.jpg';
      const safeName = `selfie-${i + 1}-${crypto.randomBytes(4).toString('hex')}${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(uploadDir, safeName), buffer);
      saved.push(safeName);
    }

    for (let i = 0; i < inspiration.length; i++) {
      const file = inspiration[i];
      const ext = path.extname(file.name).toLowerCase() || '.jpg';
      const safeName = `inspo-${i + 1}-${crypto.randomBytes(4).toString('hex')}${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(uploadDir, safeName), buffer);
      saved.push(safeName);
    }

    return NextResponse.json(
      { success: true, files: saved },
      { status: 201 }
    );
  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload photos. Please try again.' },
      { status: 500 }
    );
  }
}
