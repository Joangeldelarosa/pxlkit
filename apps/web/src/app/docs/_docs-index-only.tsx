'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * Renders its children on /docs itself, not on the pages under it. The docs
 * layout's breadcrumb (Home › Docs) is /docs's own: each component's page
 * (/docs/components/<slug>) gives its own trail.
 */
export function DocsIndexOnly({ children }: { children: ReactNode }) {
  return useSelectedLayoutSegment() === null ? <>{children}</> : null;
}
