/**
 * @pxlkit/ui-kit-angular — the Pxlkit retro UI kit for Angular.
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

export type { PxlContent } from './lib/_internal/outlet';

// Utilities — the counterparts of the React kit's hooks
export * from './lib/utilities';

// Components, by category
export * from './lib/actions';
export * from './lib/animations';
export * from './lib/cards';
export * from './lib/data';
export * from './lib/feedback';
export * from './lib/forms';
export * from './lib/hero';
export * from './lib/layout';
export * from './lib/navigation';
export * from './lib/overlay-foundation';
export * from './lib/overlays';
export * from './lib/parallax';
