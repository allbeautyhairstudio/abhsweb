import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';

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

    // Process and write all files in parallel
    async function processFile(file: File, prefix: string, index: number): Promise<string> {
      const safeName = `${prefix}-${index + 1}-${crypto.randomBytes(4).toString('hex')}.webp`;
      const buffer = Buffer.from(await file.arrayBuffer());
      const webpBuffer = await sharp(buffer)
        .rotate()
        .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      await writeFile(path.join(uploadDir, safeName), webpBuffer);
      return safeName;
    }

    const saved = await Promise.all([
      ...selfies.map((file, i) => processFile(file, 'selfie', i)),
      ...inspiration.map((file, i) => processFile(file, 'inspo', i)),
    ]);

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
