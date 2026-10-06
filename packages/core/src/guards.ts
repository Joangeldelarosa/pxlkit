import type { AnimatedPxlKitData, ParallaxPxlKitData, PxlKitData } from './types';

/** Type guard: returns true if the icon is animated (has frames) */
export function isAnimatedIcon(
  icon: PxlKitData | AnimatedPxlKitData
): icon is AnimatedPxlKitData {
  return 'frames' in icon;
}

/** Type guard: returns true if the icon is a parallax multi-layer icon (has layers) */
export function isParallaxIcon(
  icon: PxlKitData | AnimatedPxlKitData | ParallaxPxlKitData
): icon is ParallaxPxlKitData {
  return 'layers' in icon;
}
