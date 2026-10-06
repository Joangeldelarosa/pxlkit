// @pxlkit/angular — Angular bindings for the Pxlkit rendering engine.
//
// Standalone, OnPush, signal-based components that render the same markup as
// the React components in @pxlkit/core and the Vue ones in @pxlkit/vue; the
// whole framework-agnostic API of `@pxlkit/core/vanilla` is re-exported so an
// Angular app needs one import source.

export { PxlKitIcon } from './lib/pxl-kit-icon';
export { AnimatedPxlKitIcon } from './lib/animated-pxl-kit-icon';
export { ParallaxPxlKitIcon } from './lib/parallax-pxl-kit-icon';
export { PixelToast } from './lib/pixel-toast';

export * from '@pxlkit/core/vanilla';
