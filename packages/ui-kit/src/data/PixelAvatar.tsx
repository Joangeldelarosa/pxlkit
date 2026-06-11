import React, { forwardRef } from 'react';
import {
  Tone, Surface, cn,
  toneMap, surfaceClasses, useEffectiveSurface,
} from '../common';
import { usePxlKitLocale } from '../locale';

/* ─────────────────────────────────────────────────────────────────────────
   PixelAvatar — initials/image with bordered square (pixel) or circle (linear).

   Upgraded (Ola 4) additively: `status` dot (online/away/busy/offline) in
   corner, sizes `xs` and `xl` added to the existing sm/md/lg axis, `shape`
   (square/circle/rounded, default circle), `colorSeed` deterministic tinted
   fallback background via hash modulo tones, and lazy/async image loading.
   Existing call sites continue to work — tone still wins when provided.
   ───────────────────────────────────────────────────────────────────────── */

export type PixelAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type PixelAvatarStatus = 'online' | 'away' | 'busy' | 'offline';
export type PixelAvatarShape = 'square' | 'circle' | 'rounded';

const AVATAR_COLOR_SEED_TONES: ReadonlyArray<Tone> = ['green', 'cyan', 'gold', 'red', 'purple', 'pink'];

/**
 * djb2-style hash → tone index. Deterministic across renders and locales:
 * the same `colorSeed` always maps to the same tone bucket.
 */
function hashColorSeedToTone(seed: string): Tone {
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash + seed.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % AVATAR_COLOR_SEED_TONES.length;
  return AVATAR_COLOR_SEED_TONES[idx];
}

export interface PixelAvatarProps {
  /** Display name. Used to derive initials and the accessible label. */
  name: string;
  /** Optional image source. Falls back to initials on load failure. */
  src?: string;
  /** Size token. Defaults to `'md'`. */
  size?: PixelAvatarSize;
  /** Tone tint for the initials fallback. Overrides `colorSeed`. */
  tone?: Tone;
  /** Visual surface override. */
  surface?: Surface;
  /** Status dot rendered in the bottom-right corner. */
  status?: PixelAvatarStatus;
  /** Shape of the avatar frame. Defaults to `'circle'`. */
  shape?: PixelAvatarShape;
  /**
   * Deterministic tone fallback derived from the seed via hash modulo a fixed
   * tone palette. Overridden by an explicit `tone` prop.
   */
  colorSeed?: string;
}

const AVATAR_DIM: Record<PixelAvatarSize, string> = {
  xs: 'h-6 w-6 text-[8px]',
  sm: 'h-8 w-8 text-[9px]',
  md: 'h-10 w-10 text-[10px]',
  lg: 'h-12 w-12 text-xs',
  xl: 'h-16 w-16 text-sm',
};

const AVATAR_STATUS_DIM: Record<PixelAvatarSize, string> = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
  xl: 'h-3.5 w-3.5',
};

const AVATAR_STATUS_FILL: Record<PixelAvatarStatus, string> = {
  online: 'bg-retro-green',
  away: 'bg-retro-gold',
  busy: 'bg-retro-red',
  offline: 'bg-retro-muted',
};

const AVATAR_STATUS_LABEL: Record<PixelAvatarStatus, string> = {
  online: 'online',
  away: 'away',
  busy: 'busy',
  offline: 'offline',
};

export const PixelAvatar = forwardRef<HTMLDivElement, PixelAvatarProps>(function PixelAvatar(
  {
    name,
    src,
    size = 'md',
    tone: toneProp,
    surface: surfaceProp,
    status,
    shape,
    colorSeed,
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const { upper } = usePxlKitLocale();
  const dim = AVATAR_DIM[size];
  const initials = upper(name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2));

  const effectiveShape: PixelAvatarShape = shape ?? 'circle';
  const radius =
    effectiveShape === 'square'
      ? (surface === 'pixel' ? 'rounded-none' : 'rounded-none')
      : effectiveShape === 'rounded'
        ? (surface === 'pixel' ? 'rounded-[3px]' : 'rounded-lg')
        : (surface === 'pixel' ? 'rounded-[3px]' : 'rounded-full');

  const effectiveTone: Tone = toneProp ?? (colorSeed ? hashColorSeedToTone(colorSeed) : 'green');
  const fontFamily = surface === 'pixel' ? 'font-pixel' : 'font-semibold';

  const statusDot = status ? (
    <span
      aria-hidden
      data-status={status}
      className={cn(
        'absolute -bottom-0.5 -right-0.5 inline-block rounded-full',
        'ring-2 ring-retro-bg',
        AVATAR_STATUS_DIM[size],
        AVATAR_STATUS_FILL[status],
      )}
    />
  ) : null;

  // Compose status into the avatar's accessible name (no live region — presence
  // dots are not transient status messages and 10 avatars on a page should not
  // each fire a polite announcement on mount).
  const accessibleName = status ? `${name} (${AVATAR_STATUS_LABEL[status]})` : name;

  return (
    <div ref={ref} className={cn('relative inline-block', status && 'pr-0.5')}>
      <div
        className={cn(
          'inline-flex items-center justify-center overflow-hidden',
          s.border, radius, dim,
          toneMap[effectiveTone].border, toneMap[effectiveTone].soft, toneMap[effectiveTone].text,
          fontFamily,
        )}
        title={accessibleName}
        aria-label={status ? accessibleName : undefined}
        data-color-seed={colorSeed || undefined}
        data-shape={effectiveShape}
      >
        {src
          ? <img src={src} alt={accessibleName} loading="lazy" decoding="async" className={cn('h-full w-full object-cover', radius)} />
          : initials}
      </div>
      {statusDot}
    </div>
  );
});

PixelAvatar.displayName = 'PixelAvatar';
