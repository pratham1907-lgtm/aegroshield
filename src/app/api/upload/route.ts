import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireUser, handleAuthError, HttpError } from '@/lib/auth';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
];

const IMMUTABLE_CACHE_CONTROL = 'public, max-age=31536000, immutable';

function getStorageAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (
    !supabaseUrl ||
    !serviceKey ||
    supabaseUrl.includes('[') ||
    serviceKey.startsWith('your_')
  ) {
    return null;
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

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

    // 6. Read buffer & upload to Supabase Storage CDN (with immutable 1-year cacheControl) when available
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let publicUrl = '';
    const supabase = getStorageAdminClient();
    if (supabase) {
      try {
        const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || 'product-media';
        const { error: uploadErr } = await supabase.storage
          .from(bucket)
          .upload(uniqueFileName, buffer, {
            contentType: file.type,
            cacheControl: '31536000',
            upsert: false,
          });

        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(uniqueFileName);
          if (urlData?.publicUrl) {
            publicUrl = urlData.publicUrl;
          }
        }
      } catch (storageErr) {
        console.warn('[API/Upload] Supabase Storage upload skipped, falling back to data URI:', storageErr);
      }
    }

    // Graceful fallback to Data URI when external bucket permissions are not yet provisioned
    if (!publicUrl) {
      publicUrl = `data:${file.type};base64,${buffer.toString('base64')}`;
    }

    return NextResponse.json(
      {
        success: true,
        url: publicUrl,
        fileName: uniqueFileName,
        originalName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        cacheControl: IMMUTABLE_CACHE_CONTROL,
        uploadedAt: new Date().toISOString(),
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error: any) {
    console.error('[API/Upload] POST error:', error);
    return handleAuthError(error);
  }
}
