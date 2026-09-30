import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Brak dostępu.' }, { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: 'Dodaj magazyn Vercel Blob w projekcie.' }, { status: 503 });
  const body = await request.json() as HandleUploadBody;
  const jsonResponse = await handleUpload({
    body,
    request,
    onBeforeGenerateToken: async () => ({
      allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
      maximumSizeInBytes: 12 * 1024 * 1024,
      addRandomSuffix: true,
    }),
    onUploadCompleted: async () => undefined,
  });
  return NextResponse.json(jsonResponse);
}