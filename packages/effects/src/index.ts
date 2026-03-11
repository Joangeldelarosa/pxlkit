// @pxlkit/effects — Animated visual effect icons

export { ExplosionBurst } from './icons/explosion-burst';
export { RadarPing } from './icons/radar-ping';
export { Flame } from './icons/flame';
export { GlowPulse } from './icons/glow-pulse';
export { PixelRain } from './icons/pixel-rain';
export { Shockwave } from './icons/shockwave';
export { SparkBurst } from './icons/spark-burst';
export { ScanSweep } from './icons/scan-sweep';
export { Twinkle } from './icons/twinkle';
export { Ripple } from './icons/ripple';
export { NeonStrobe } from './icons/neon-strobe';
export { PortalSpin } from './icons/portal-spin';

import type { IconPack } from '@pxlkit/core';
import { ExplosionBurst } from './icons/explosion-burst';
import { RadarPing } from './icons/radar-ping';
import { Flame } from './icons/flame';
import { GlowPulse } from './icons/glow-pulse';
import { PixelRain } from './icons/pixel-rain';
import { Shockwave } from './icons/shockwave';
import { SparkBurst } from './icons/spark-burst';
import { ScanSweep } from './icons/scan-sweep';
import { Twinkle } from './icons/twinkle';
import { Ripple } from './icons/ripple';
import { NeonStrobe } from './icons/neon-strobe';
import { PortalSpin } from './icons/portal-spin';

/**
 * The Effects icon pack.
 * Contains animated icons for visual effects, particles, explosions, and VFX.
 * All icons in this pack are animated.
 */
export const EffectsPack: IconPack = {
  id: 'effects',
  name: 'Effects',
  description: 'Animated visual effects — explosions, signals, particles, glows, and VFX',
  icons: [
    ExplosionBurst,
    RadarPing,
    Flame,
    GlowPulse,
    PixelRain,
    Shockwave,
    SparkBurst,
    ScanSweep,
    Twinkle,
    Ripple,
    NeonStrobe,
    PortalSpin,
  ],
  version: '0.1.0',
  author: 'pxlkit',
};
