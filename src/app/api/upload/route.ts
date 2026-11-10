import { NextRequest, NextResponse } from 'next/server';
import { requireUser, handleAuthError, HttpError } from '@/lib/auth';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
];

export async function POST(request: NextRequest) {
  try {
    // 1. Enforce Authentication
    const user = await requireUser(request);

    // 2. Parse Multipart Form Data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'documents';

    if (!file) {
      throw new HttpError('No file provided in form data. Expected "file" field.', 400);
    }

    // 3. Strict Size Validation
    if (file.size > MAX_FILE_SIZE) {
      throw new HttpError(`File size exceeds 5MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)} MB.`, 400);
    }

    // 4. Strict MIME Type Validation
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new HttpError(
        `Unsupported file type "${file.type}". Allowed types: JPG, PNG, WEBP, GIF, PDF.`,
        400
      );
    }

    // 5. Sanitize Filename
    const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const extension = sanitizedOriginalName.split('.').pop() || 'dat';
    const uniqueFileName = `${folder}/${user.id}_${Date.now()}.${extension}`;

    // 6. Convert file to buffer / Base64 Data URL or Cloud Storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // For serverless deployments where external bucket permissions might be pending,
    // a base64 Data URI is reliable, zero-latency, and persists inside standard Prisma text columns.
    const base64Data = `data:${file.type};base64,${buffer.toString('base64')}`;

    return NextResponse.json({
      success: true,
      url: base64Data,
      fileName: uniqueFileName,
      originalName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      uploadedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API/Upload] POST error:', error);
    return handleAuthError(error);
  }
}
