import type { Metadata } from 'next';
import { BrandIcon } from '../../../components/Logo';

export const metadata: Metadata = {
  title: 'Pxlkit — Icon preview',
  robots: { index: false, follow: false },
};

/**
 * Renders just the BrandIcon centred on a square dark canvas, sized via the
 * `s` search param (default 512). Used by `npm run og:capture` to generate
 * /icon-192.png, /icon-512.png, /apple-touch-icon.png, /favicon-32x32.png,
 * /favicon-16x16.png and the maskable variants in /public.
 *
 * Params:
 *   s     — canvas size in px (default 512)
 *   mask  — "1" → maskable variant: icon scaled to ~52% of canvas so it sits
 *           inside the 40% safe zone Android uses when cropping into a
 *           circle / squircle / square shape
 *   small — "1" → strip the radial glow + scanlines (visual noise that
 *           muddies a 16/32px favicon); keep just dark bg + icon
 */
export default async function IconRoute({
  searchParams,
}: {
  searchParams: Promise<{ s?: string; mask?: string; small?: string }>;
}) {
  const params = await searchParams;
  const sizeParam = Number(params.s ?? '512');
  const size = Number.isFinite(sizeParam) && sizeParam > 0 ? sizeParam : 512;
  const maskable = params.mask === '1';
  const small = params.small === '1';

  // Standard: 70% of canvas. Maskable: ~52% to live inside Android's 40%
  // central safe zone. Small (16/32 favicon): 80% so the P fills the tile.
  const iconRatio = maskable ? 0.52 : small ? 0.8 : 0.7;
  const iconSize = Math.max(8, Math.round(size * iconRatio));

  return (
    <main
      data-testid="og-icon"
      className="bg-retro-bg relative overflow-hidden flex items-center justify-center text-retro-green"
      style={{
        width: size,
        height: size,
      }}
    >
      {!small && (
        <>
          {/* Soft radial glow */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at center, rgba(0, 200, 120, 0.18) 0%, rgba(0, 200, 120, 0) 60%)',
            }}
          />
          {/* Scanline overlay */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              background:
                'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 3px)',
            }}
          />
        </>
      )}
      <div className="relative z-10">
        <BrandIcon size={iconSize} withDepth withSparkle={!small} />
      </div>
    </main>
  );
}
