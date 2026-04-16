'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

/**
 * Wraps the page in the site chrome (Navbar + Footer) for all routes
 * EXCEPT isolated preview routes that need a blank canvas.
 */
export function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isIsolated = pathname === '/templates/preview';

  if (isIsolated) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
