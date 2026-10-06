// @pxlkit/vue — Vue 3 bindings for the Pxlkit rendering engine.
//
// Components mirror the React ones in @pxlkit/core (same names, same
// rendered markup); the whole framework-agnostic API of
// `@pxlkit/core/vanilla` is re-exported so a Vue app needs one import source.

export { PxlKitIcon, type PxlKitProps } from './components/PxlKitIcon';
export { AnimatedPxlKitIcon, type AnimatedPxlKitProps } from './components/AnimatedPxlKitIcon';
export { ParallaxPxlKitIcon, type ParallaxPxlKitProps } from './components/ParallaxPxlKitIcon';
export { PixelToast, type PixelToastProps } from './components/PixelToast';

export * from '@pxlkit/core/vanilla';
