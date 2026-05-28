import type { AnyIcon, IconPack } from '@pxlkit/core';
import { GamificationPack } from '@pxlkit/gamification';
import { FeedbackPack } from '@pxlkit/feedback';
import { SocialPack } from '@pxlkit/social';
import { WeatherPack } from '@pxlkit/weather';
import { UiPack } from '@pxlkit/ui';
import { EffectsPack } from '@pxlkit/effects';

const PACKS: IconPack[] = [
  GamificationPack,
  FeedbackPack,
  SocialPack,
  WeatherPack,
  UiPack,
  EffectsPack,
];

export function getPacks(): IconPack[] {
  return PACKS;
}

export function getPackById(id: string): IconPack | undefined {
  return PACKS.find((p) => p.id === id);
}

export function findIcon(packId: string, name: string): AnyIcon | undefined {
  return getPackById(packId)?.icons.find((i) => i.name === name);
}

export function allIcons(): Array<{ pack: string; icon: AnyIcon }> {
  return PACKS.flatMap((p) => p.icons.map((icon) => ({ pack: p.id, icon })));
}
