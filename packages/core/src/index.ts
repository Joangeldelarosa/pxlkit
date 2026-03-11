// @pxlkit/core — Public API
// The foundation for pixel art icon rendering and utilities

export type {
  GridSize,
  Pixel,
  PxlKitData,
  AnyIcon,
  IconPack,
  SvgOptions,
  PxlKitProps,
  PixelToastProps,
  AnimationFrame,
  AnimationTrigger,
  AnimatedPxlKitData,
  AnimatedPxlKitProps,
  AnimatedIconPack,
} from './types';

export { PxlKitIcon } from './components/PxlKitIcon';
export { PixelToast } from './components/PixelToast';
export { AnimatedPxlKitIcon } from './components/AnimatedPxlKitIcon';

/** Type guard: returns true if the icon is animated (has frames) */
export function isAnimatedIcon(
  icon: import('./types').PxlKitData | import('./types').AnimatedPxlKitData
): icon is import('./types').AnimatedPxlKitData {
  return 'frames' in icon;
}

export {
  gridToPixels,
  pixelsToGrid,
  parseHexColor,
  encodeHexColor,
  pixelsToSvg,
  gridToSvg,
  svgToDataUri,
  svgToBase64,
  validateIconData,
  isValidIconData,
  parseIconCode,
  parseAnyIconCode,
  generateIconCode,
  adjustBrightness,
  hexToRgb,
  rgbToHex,
  getPerceivedBrightness,
  RETRO_PALETTES,
  generateAnimatedSvg,
  animatedToFrameIcons,
} from './utils';

export type { ValidationError, RetropaletteName } from './utils';
