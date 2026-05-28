import type { Metadata } from 'next';
import { BrandIcon } from '../../../components/Logo';

export const metadata: Metadata = {
  title: 'Pxlkit — Icon preview',
  robots: { index: false, follow: false },
};

/**
 * Renders just the BrandIcon centred on a square dark canvas, sized via the
 * `s` search param (default 512). Used by `npm run og:capture` to generate
 * /icon-192.png, /icon-512.png, /apple-touch-icon.png in /public.
 *
 * Layout: dark-bg square with a soft retro-green glow + the icon at ~70%
 * of the canvas, occupying the visual centre.
 */
export default async function IconRoute({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const params = await searchParams;
  const sizeParam = Number(params.s ?? '512');
  const size = Number.isFinite(sizeParam) && sizeParam > 0 ? sizeParam : 512;

  // The icon takes ~70% of the canvas, leaving comfortable margin for the glow.
  const iconSize = Math.round(size * 0.7);

  return (
    <main
      data-testid="og-icon"
      className="bg-retro-bg w-screen h-screen relative overflow-hidden flex items-center justify-center text-retro-green"
      style={{
        width: size,
        height: size,
      }}
    >
      {/* Soft glow background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at center, rgba(0, 200, 120, 0.18) 0%, rgba(0, 200, 120, 0) 60%)',
        }}
      />
      {/* Subtle scanline overlay so the dark BG never looks flat */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 3px)',
        }}
      />
      {/* The icon itself */}
      <div className="relative z-10">
        <BrandIcon size={iconSize} withDepth withSparkle />
      </div>
    </main>
  );
}
