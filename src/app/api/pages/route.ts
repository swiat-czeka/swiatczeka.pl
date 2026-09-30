import { publishDocument } from '@/lib/publish';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  return publishDocument(request, 'pages');
}