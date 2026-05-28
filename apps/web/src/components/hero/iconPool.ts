import { isAnimatedIcon, type PxlKitData, type AnimatedPxlKitData } from '@pxlkit/core';
import { GamificationPack } from '@pxlkit/gamification';
import { FeedbackPack } from '@pxlkit/feedback';
import { SocialPack } from '@pxlkit/social';
import { WeatherPack } from '@pxlkit/weather';
import { UiPack } from '@pxlkit/ui';
import { EffectsPack } from '@pxlkit/effects';

export type AnyIcon = PxlKitData | AnimatedPxlKitData;

const PACKS = [GamificationPack, FeedbackPack, SocialPack, WeatherPack, UiPack, EffectsPack];

/** All static + animated icons across the 6 themed packs (parallax pack excluded — its 3D-layer icons need their own renderer). */
export const ALL_ICONS: AnyIcon[] = PACKS.flatMap((p) => p.icons as AnyIcon[]);

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickRandom(): { icon: AnyIcon; isAnimated: boolean } {
  const icon = ALL_ICONS[Math.floor(Math.random() * ALL_ICONS.length)];
  return { icon, isAnimated: isAnimatedIcon(icon) };
}
