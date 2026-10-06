/**
 * @pxlkit/ui-kit-vue — the Pxlkit retro UI kit for Vue 3.
 *
 * Same components, markup, theme and behaviour as the React kit
 * (`@pxlkit/ui-kit`); both are built on `@pxlkit/ui-kit-core`.
 */

// Framework-neutral vocabulary, re-exported so one import covers the kit.
export {
  PXLKIT_FONTS,
  TURKISH_CHARACTERS,
  buildGoogleFontsUrl,
  cn,
  containerWidth,
  durations,
  easings,
  focusRing,
  inputBase,
  pageGutter,
  pixelDot,
  pixelRadius,
  pixelType,
  rhythm,
  sectionRhythm,
  sizeClass,
  sizeHeight,
  sizeSquare,
  stackGap,
  surfaceClasses,
  toLocaleLower,
  toLocaleUpper,
  tone,
  toneMap,
  type ContainerWidth,
  type DarkMode,
  type PxlKitLocaleContextValue,
  type ResolvedMode,
  type PageGutter,
  type PxlKitFontConfig,
  type PxlKitLocale,
  type RhythmKey,
  type SectionRhythmKey,
  type Size,
  type StackGapKey,
  type Surface,
  type SurfaceClasses,
  type Tone,
  type ToneKey,
  type Variant,
} from '@pxlkit/ui-kit-core';

export type { PxlNode } from './_internal/render-node.js';

// Composables — the counterparts of the React kit's hooks
export { useControllableState, type UseControllableStateOptions } from './composables/controllable.js';
export { useDarkMode } from './composables/dark-mode.js';
export { useEventListener } from './composables/event-listener.js';
export { useLocalStorage, type UseLocalStorageOptions } from './composables/local-storage.js';
export { PXLKIT_LOCALE, usePxlKitLocale } from './composables/locale.js';
export { useMediaQuery, useReducedMotion } from './composables/media-query.js';
export { useClickOutside, useEscape, useFocusTrap, useScrollLock } from './composables/overlay.js';
export { PXLKIT_SURFACE, useEffectiveSurface, usePxlKitSurface } from './composables/surface.js';

// Components, by category
export * from './actions/index.js';
export * from './animations/index.js';
export * from './cards/index.js';
export * from './data/index.js';
export * from './feedback/index.js';
export * from './forms/index.js';
export * from './hero/index.js';
export * from './layout/index.js';
export * from './navigation/index.js';
export * from './overlay-foundation/index.js';
export * from './overlays/index.js';
export * from './parallax/index.js';
