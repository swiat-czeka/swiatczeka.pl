'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

/** Próbuje wersji w pełnej rozdzielczości, a gdy jej nie ma na serwerze — wraca do miniatury. */
export function SmartImage({ src, fallback, alt, ...props }: Omit<ImageProps, 'src'> & { src: string; fallback?: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  const current = failed === src && fallback ? fallback : src;
  return <Image {...props} alt={alt} src={current} onError={() => { if (fallback && current !== fallback) setFailed(src); }} />;
}
