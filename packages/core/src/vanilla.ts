// @pxlkit/core/vanilla — the framework-agnostic half of @pxlkit/core.
//
// Everything here runs without React: the icon data types, the utilities and
// the rendering engine (SVG renderer, animation player, parallax controller,
// toast view model) that the React, Vue and Angular components are built on.
// Nothing in this module graph imports a UI framework.

export type {
  GridSize,
  Pixel,
  PxlKitData,
  AnyIcon,
  IconPack,
  AnimatedIconPack,
  IconAppearance,
  SvgOptions,
  AnimationFrame,
  AnimationTrigger,
  AnimatedPxlKitData,
  ParallaxLayer,
  ParallaxPxlKitData,
} from './types';

export { isAnimatedIcon, isParallaxIcon } from './guards';

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

export * from './engine';
