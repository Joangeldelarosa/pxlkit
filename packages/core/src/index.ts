// @pxlkit/core — Public API
// The foundation for pixel art icon rendering and utilities.
//
// This entry = the framework-agnostic API + the React components. The
// framework-agnostic half (types, utilities, rendering engine) is also
// published React-free as `@pxlkit/core/vanilla`, which is what
// `@pxlkit/vue`, `@pxlkit/angular` and the icon packs build on.

export * from './vanilla';

export type {
  PxlKitProps,
  PixelToastProps,
  AnimatedPxlKitProps,
  ParallaxPxlKitProps,
} from './components/types';

export { PxlKitIcon } from './components/PxlKitIcon';
export { PixelToast } from './components/PixelToast';
export { AnimatedPxlKitIcon } from './components/AnimatedPxlKitIcon';
export { ParallaxPxlKitIcon } from './components/ParallaxPxlKitIcon';
