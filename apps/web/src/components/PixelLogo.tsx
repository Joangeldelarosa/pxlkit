'use client';

/**
 * The Pxlkit brand logo — a pixel art "P" in a framed box,
 * matching the favicon design.
 *
 * Colors: green/cyan frame, gold "P" letter, red sparkle accent.
 * Uses CSS custom properties to adapt to light/dark themes.
 */

interface PixelLogoProps {
  size?: number;
  className?: string;
}

export function PixelLogo({ size = 32, className = '' }: PixelLogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      shapeRendering="crispEdges"
      role="img"
      aria-label="Pxlkit logo"
    >
      {/* Background */}
      <rect width="32" height="32" fill="rgb(var(--retro-bg))" rx="4" />
      {/* Outer frame — green top/left, cyan right/bottom */}
      <rect x="4" y="2" width="24" height="2" fill="rgb(var(--retro-green))" />
      <rect x="2" y="4" width="2" height="24" fill="rgb(var(--retro-green))" />
      <rect x="28" y="4" width="2" height="24" fill="rgb(var(--retro-cyan))" />
      <rect x="4" y="28" width="24" height="2" fill="rgb(var(--retro-cyan))" />
      {/* Corner pixels */}
      <rect x="4" y="4" width="2" height="2" fill="rgb(var(--retro-green))" />
      <rect x="26" y="4" width="2" height="2" fill="rgb(var(--retro-cyan))" />
      <rect x="4" y="26" width="2" height="2" fill="rgb(var(--retro-cyan))" />
      <rect x="26" y="26" width="2" height="2" fill="rgb(var(--retro-cyan))" />
      {/* Inner pixel art: stylized "P" in gold */}
      <rect x="8" y="8" width="2" height="14" fill="rgb(var(--retro-gold))" />
      <rect x="10" y="8" width="8" height="2" fill="rgb(var(--retro-gold))" />
      <rect x="18" y="10" width="2" height="6" fill="rgb(var(--retro-gold))" />
      <rect x="10" y="14" width="8" height="2" fill="rgb(var(--retro-gold))" />
      {/* Sparkle/dot accent in red */}
      <rect x="22" y="20" width="2" height="2" fill="rgb(var(--retro-red))" />
      <rect x="24" y="18" width="2" height="2" fill="rgb(var(--retro-red))" />
      <rect x="22" y="22" width="4" height="2" fill="rgb(var(--retro-red))" />
    </svg>
  );
}

/**
 * Full brand mark: "P" logo + "PXLKIT" text.
 * Use this in the navbar and footer.
 */
export function PixelBrandMark({
  size = 28,
  textClassName = '',
  className = '',
}: {
  size?: number;
  textClassName?: string;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 sm:gap-2.5 ${className}`}>
      <PixelLogo size={size} />
      <span
        className={`font-pixel text-[10px] sm:text-xs tracking-wider text-retro-green ${textClassName}`}
        style={{
          textShadow: '1px 1px 0 rgb(var(--retro-green-dim) / 0.5), 0 0 8px rgb(var(--retro-green) / 0.25)',
        }}
      >
        PXLKIT
      </span>
    </span>
  );
}
