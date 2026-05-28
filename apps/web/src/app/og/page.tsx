import type { Metadata } from 'next';
import { OgFrame } from './OgFrame';

export const metadata: Metadata = {
  title: 'Pxlkit — OG preview',
  robots: { index: false, follow: false },
};

/**
 * Curated full-bleed frame used by the OG / Twitter / README screenshot
 * pipeline (`npm run og:capture`). NOT chrome-wrapped — see ConditionalShell
 * NO_CHROME_PREFIXES.
 *
 * The composition is intentionally STATIC (no spawn, no scroll, no tilt) so
 * captures are deterministic and the image is legible at 1280×640 / 1200×630.
 */
export default function OgPage() {
  return <OgFrame />;
}
