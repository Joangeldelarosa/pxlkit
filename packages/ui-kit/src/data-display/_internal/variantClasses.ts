import { Tone, cn, toneMap } from '../../common';

/** Variant axis shared by PixelBadge + PixelChip. */
export type PixelBadgeVariant = 'soft' | 'solid' | 'outline' | 'ghost';

/**
 * Resolve the tone+variant class string for badge-like primitives.
 * Shared by PixelBadge and PixelChip to keep their visual axes identical.
 */
export function variantClasses(variant: PixelBadgeVariant, tone: Tone) {
  const t = toneMap[tone];
  switch (variant) {
    case 'solid':
      return cn(t.bg, t.border, tone === 'neutral' ? 'text-retro-text' : 'text-retro-bg');
    case 'outline':
      return cn('bg-transparent', t.border, t.text);
    case 'ghost':
      return cn('bg-transparent border-transparent', t.text);
    case 'soft':
    default:
      return cn(t.soft, t.border, t.text);
  }
}
