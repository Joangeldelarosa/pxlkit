/**
 * Badge-like primitives (PixelBadge, PixelChip): the shared variant axis and
 * size scale.
 */
import { cn, toneMap, type Size, type Tone } from '../../common';

/** Variant axis shared by PixelBadge + PixelChip. */
export type PixelBadgeVariant = 'soft' | 'solid' | 'outline' | 'ghost';

/**
 * Resolve the tone+variant class string for badge-like primitives.
 * Shared by PixelBadge and PixelChip to keep their visual axes identical.
 *
 * `solid` paints the opaque tone fill (`t.fill`) so contrast clears WCAG AA.
 * Text color is chosen per-tone:
 *   - warm tones (cyan/green/gold/pink/orange) → dark page text
 *   - cool/dark tones (purple/red) → light page text
 *   - neutral → page text
 */
export function badgeVariantClasses(variant: PixelBadgeVariant, tone: Tone): string {
  const t = toneMap[tone];
  switch (variant) {
    case 'solid': {
      const textOnFill =
        tone === 'neutral'
          ? 'text-retro-bg'
          : tone === 'purple' || tone === 'red'
            ? 'text-retro-text'
            : 'text-retro-bg';
      return cn(t.fill, t.border, textOnFill);
    }
    case 'outline':
      return cn('bg-transparent', t.border, t.text);
    case 'ghost':
      return cn('bg-transparent border-transparent', t.text);
    case 'soft':
    default:
      return cn(t.soft, t.border, t.text);
  }
}

/** PixelBadge padding, type size and gap per size. */
export const badgeSizeClasses: Record<Size, string> = {
  sm: 'px-2 py-0.5 text-[11px] gap-1 tracking-wide',
  md: 'px-2.5 py-1 text-xs gap-1.5 tracking-wide',
  lg: 'px-3 py-1.5 text-sm gap-1.5 tracking-wide',
};
