import { isAdmin } from '@/lib/auth';
import { Studio } from '@/components/studio';

export const metadata = { title: 'Studio' };
export const dynamic = 'force-dynamic';

export default async function StudioPage() {
  return <Studio authenticated={await isAdmin()} />;
}