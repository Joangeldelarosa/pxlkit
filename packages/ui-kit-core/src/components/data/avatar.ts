/**
 * PixelAvatar — the initials / image frame, its sizes and shapes, the
 * presence dot, and the tone a colour seed picks.
 */
import { cn, surfaceClasses, toneMap, type Surface, type Tone } from '../../common';

export type PixelAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type PixelAvatarStatus = 'online' | 'away' | 'busy' | 'offline';
export type PixelAvatarShape = 'square' | 'circle' | 'rounded';

/** Frame dimensions and initials type size per size. */
export const avatarSizeClasses: Record<PixelAvatarSize, string> = {
  xs: 'h-6 w-6 text-[8px]',
  sm: 'h-8 w-8 text-[9px]',
  md: 'h-10 w-10 text-[10px]',
  lg: 'h-12 w-12 text-xs',
  xl: 'h-16 w-16 text-sm',
};

/** Presence dot dimensions per avatar size. */
export const avatarStatusSizeClasses: Record<PixelAvatarSize, string> = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
  xl: 'h-3.5 w-3.5',
};

/** Presence dot fill per status. */
export const avatarStatusFillClasses: Record<PixelAvatarStatus, string> = {
  online: 'bg-retro-green',
  away: 'bg-retro-gold',
  busy: 'bg-retro-red',
  offline: 'bg-retro-muted',
};

/** The word a status adds to the avatar's accessible name. */
export const avatarStatusLabels: Record<PixelAvatarStatus, string> = {
  online: 'online',
  away: 'away',
  busy: 'busy',
  offline: 'offline',
};

/** Corner radius per surface and shape; the image is clipped to it too. */
export const avatarRadiusClasses: Record<Surface, Record<PixelAvatarShape, string>> = {
  pixel: { square: 'rounded-none', rounded: 'rounded-[3px]', circle: 'rounded-[3px]' },
  linear: { square: 'rounded-none', rounded: 'rounded-lg', circle: 'rounded-full' },
};

const SEED_TONES: readonly Tone[] = ['green', 'cyan', 'gold', 'red', 'purple', 'pink'];

/**
 * The tone a colour seed maps to: a djb2-style hash modulo the tone palette,
 * so a seed (an email, a user id) gets the same tone on every render and in
 * every locale.
 */
export function avatarSeedTone(seed: string): Tone {
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash + seed.charCodeAt(i)) | 0;
  }
  return SEED_TONES[Math.abs(hash) % SEED_TONES.length];
}

/** The tone of the initials fallback: an explicit tone wins over the colour seed. */
export function avatarTone(tone: Tone | undefined, colorSeed: string | undefined): Tone {
  return tone ?? (colorSeed ? avatarSeedTone(colorSeed) : 'green');
}

/** The first letters of the first two words of a name, upper-cased by `upper` (locale-aware). */
export function avatarInitials(name: string, upper: (text: string) => string): string {
  return upper(
    name
      .split(/\s+/)
      .map((word) => word[0])
      .join('')
      .slice(0, 2),
  );
}

/**
 * The avatar's accessible name. A status is part of it rather than a live
 * region: presence dots are not transient messages, and a page of avatars
 * would otherwise announce every one of them on mount.
 */
export function avatarAccessibleName(name: string, status: PixelAvatarStatus | undefined): string {
  return status ? `${name} (${avatarStatusLabels[status]})` : name;
}

export interface AvatarClassOptions {
  size: PixelAvatarSize;
  shape: PixelAvatarShape;
  tone: Tone;
  status: PixelAvatarStatus | undefined;
}

export interface AvatarClasses {
  /** The wrapper, which leaves room for the presence dot. */
  root: string;
  /** The bordered, tinted frame holding the initials or the image. */
  frame: string;
  /** The image, clipped to the frame's corners. */
  image: string;
  /** The presence dot; empty without a status. */
  status: string;
}

/** Classes of every part of the avatar. */
export function avatarClasses(surface: Surface, { size, shape, tone, status }: AvatarClassOptions): AvatarClasses {
  const s = surfaceClasses(surface);
  const t = toneMap[tone];
  const radius = avatarRadiusClasses[surface][shape];
  return {
    root: cn('relative inline-block', status && 'pr-0.5'),
    frame: cn(
      'inline-flex items-center justify-center overflow-hidden',
      s.border,
      radius,
      avatarSizeClasses[size],
      t.border,
      t.soft,
      t.text,
      surface === 'pixel' ? 'font-pixel' : 'font-semibold',
    ),
    image: cn('h-full w-full object-cover', radius),
    status: status
      ? cn(
          'absolute -bottom-0.5 -right-0.5 inline-block rounded-full',
          'ring-2 ring-retro-bg',
          avatarStatusSizeClasses[size],
          avatarStatusFillClasses[status],
        )
      : '',
  };
}
