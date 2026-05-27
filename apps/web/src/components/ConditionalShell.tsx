'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

/**
 * Wraps the page in the site chrome (Navbar + Footer) for all routes
 * EXCEPT isolated routes that need full-bleed real estate.
 *
 * - `/templates/preview` → blank canvas for iframe-embedded template previews.
 * - `/dev/*` → internal, unpublished dev tools (icon inspector). No chrome at all.
 * - `/explore` → full-screen 3D voxel viewport; keeps Navbar but hides Footer.
 */
const NO_CHROME_ROUTES = new Set(['/templates/preview']);
const NO_CHROME_PREFIXES = ['/dev'];
const NO_FOOTER_ROUTES = new Set(['/explore']);

export function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (NO_CHROME_ROUTES.has(pathname) || NO_CHROME_PREFIXES.some((p) => pathname.startsWith(p))) {
    return <>{children}</>;
  }

  const hideFooter = NO_FOOTER_ROUTES.has(pathname);

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
    </>
  );
}
