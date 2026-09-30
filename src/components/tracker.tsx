'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function Tracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith('/studio')) return;
    const body = JSON.stringify({ path: pathname });
    if (!navigator.sendBeacon?.('/api/track', new Blob([body], { type: 'application/json' }))) {
      void fetch('/api/track', { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true });
    }
  }, [pathname]);
  return null;
}
