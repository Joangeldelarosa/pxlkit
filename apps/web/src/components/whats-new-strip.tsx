'use client';

import Link from 'next/link';
import { PixelBadge, PixelCard, PixelChip } from '@pxlkit/ui-kit';

export interface WhatsNewItem {
  component: string;
  blurb: string;
  tone?: 'green' | 'cyan' | 'gold' | 'red' | 'purple' | 'pink' | 'neutral';
}

export interface WhatsNewStripProps {
  items?: WhatsNewItem[];
  version?: string;
  changelogHref?: string;
}

const DEFAULT_VERSION = '1.5.0';

const DEFAULT_ITEMS: WhatsNewItem[] = [
  {
    component: 'PixelToast',
    blurb: 'Pixel-art toast notifications wired into the kit with positions, tones, and icon slots.',
    tone: 'green',
  },
  {
    component: 'forwardRef everywhere',
    blurb: 'Every interactive primitive now forwards refs — drop-in compatible with form libs and a11y tools.',
    tone: 'cyan',
  },
  {
    component: 'A11y wiring pass',
    blurb: 'ARIA labels, focus rings, keyboard handlers swept across buttons, inputs, modals, and overlays.',
    tone: 'purple',
  },
  {
    component: 'PxlKitSurfaceProvider',
    blurb: 'Switch every nested component between pixel and linear aesthetics with one provider.',
    tone: 'gold',
  },
  {
    component: 'PxlKitLocaleProvider',
    blurb: 'Locale-safe casing (Turkish İ/I) plus Google Fonts URL builder for correct subsetting.',
    tone: 'pink',
  },
  {
    component: 'PixelParallax suite',
    blurb: 'Mouse + scroll parallax wrappers ship inside the kit — same API as the rest of the surface system.',
    tone: 'cyan',
  },
];

/**
 * Surfaces recent ui-kit changes for the showcase site. Pure presentational —
 * data is passed in via props (or falls back to the v1.5.0 highlights). Uses
 * ui-kit primitives so it doubles as dogfood for the surface system.
 */
export default function WhatsNewStrip({
  items = DEFAULT_ITEMS,
  version = DEFAULT_VERSION,
  changelogHref = 'https://github.com/joangeldelarosa/pxlkit/blob/main/CHANGELOG.md',
}: WhatsNewStripProps) {
  return (
    <section
      aria-labelledby="whats-new-heading"
      className="w-full max-w-6xl mx-auto px-4 py-10"
    >
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h2
          id="whats-new-heading"
          className="text-xl sm:text-2xl font-bold tracking-tight"
        >
          What&apos;s New in @pxlkit/ui-kit
        </h2>
        <PixelBadge tone="green">v{version}</PixelBadge>
        <PixelChip label="forwardRef + a11y + PixelToast" tone="cyan" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.slice(0, 6).map((item) => (
          <PixelCard key={item.component} title={item.component}>
            <p className="text-sm leading-relaxed opacity-90">{item.blurb}</p>
            {item.tone ? (
              <div className="mt-3">
                <PixelChip label={item.component} tone={item.tone} />
              </div>
            ) : null}
          </PixelCard>
        ))}
      </div>

      <div className="mt-6 text-sm">
        <Link
          href={changelogHref}
          className="underline underline-offset-4 hover:opacity-80"
        >
          See full changelog →
        </Link>
      </div>
    </section>
  );
}
